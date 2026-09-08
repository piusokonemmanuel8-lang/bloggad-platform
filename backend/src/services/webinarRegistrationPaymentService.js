const crypto = require('crypto');
const pool = require('../config/db');
const {
  getReaderSubscriptionCheckoutOptions,
  getGatewayCredentials,
  verifyPaystack,
  verifyFlutterwave,
  verifyPayPal,
  fetchJson,
  paypalJson,
  moneyString,
  decimalToCents,
} = require('./readerSubscriptionPaymentService');
const {
  loadRegistrationByToken,
} = require('./webinarRegistrationService');

const PROVIDERS = new Set(['paystack', 'flutterwave', 'paypal']);

function normalizeProvider(value) {
  const provider = String(value || '').trim().toLowerCase();
  return PROVIDERS.has(provider) ? provider : null;
}

function cleanFailure(error) {
  return String(error?.message || error || 'Payment request failed.')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function frontendOrigin() {
  const raw = String(process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '');

  try {
    return new URL(raw).origin;
  } catch {
    return 'http://localhost:5173';
  }
}

function callbackUrls(provider, purchase, registration) {
  const origin = frontendOrigin();
  const encoded = encodeURIComponent(purchase.merchant_reference);
  const callbackBase = `${origin}/api/public/webinars/checkout`;
  const publicPath =
    `${origin}/webinars/${encodeURIComponent(registration.writer_page_slug)}/` +
    `${encodeURIComponent(registration.webinar_slug)}`;

  if (provider === 'paypal') {
    return {
      returnUrl: `${callbackBase}/callback/paypal?purchase_ref=${encoded}`,
      cancelUrl: `${callbackBase}/cancel/paypal?purchase_ref=${encoded}`,
    };
  }

  return {
    returnUrl: `${callbackBase}/callback/${provider}`,
    cancelUrl:
      `${publicPath}?registration_payment=cancelled&registration_token=` +
      encodeURIComponent(registration.registration_token),
  };
}

function merchantReference(registrationId) {
  return [
    'BGWREG',
    Number(registrationId),
    Date.now().toString(36).toUpperCase(),
    crypto.randomBytes(6).toString('hex').toUpperCase(),
  ].join('-').slice(0, 120);
}

async function loadPurchaseByReference(reference, connection = pool) {
  const cleanReference = String(reference || '').trim();

  if (!cleanReference) return null;

  const [[row]] = await connection.query(
    `
    SELECT
      p.*,
      wr.registration_token,
      wr.attendee_name,
      wr.attendee_email,
      wr.status AS registration_status,
      wr.payment_status,
      w.slug AS webinar_slug,
      w.title AS webinar_title,
      wp.slug AS writer_page_slug
    FROM webinar_registration_purchases p
    INNER JOIN webinar_registrations wr
      ON wr.id = p.registration_id
    INNER JOIN webinars w
      ON w.id = p.webinar_id
    INNER JOIN writer_pages wp
      ON wp.id = w.writer_page_id
    WHERE p.merchant_reference = ?
    LIMIT 1
    `,
    [cleanReference]
  );

  return row || null;
}

function sanitizePurchase(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    registration_id: Number(row.registration_id),
    webinar_id: Number(row.webinar_id),
    session_id: row.session_id ? Number(row.session_id) : null,
    provider: row.provider,
    gateway_mode: row.gateway_mode,
    merchant_reference: row.merchant_reference,
    provider_reference: row.provider_reference || null,
    provider_transaction_id: row.provider_transaction_id || null,
    expected_amount_usd: moneyString(row.expected_amount_usd),
    currency_code: String(row.currency_code || 'USD').toUpperCase(),
    status: row.status,
    checkout_url: row.checkout_url || null,
    failure_reason: row.failure_reason || null,
    paid_at: row.paid_at || null,
  };
}

async function initializePaystack({ gateway, purchase, registration }) {
  const urls = callbackUrls('paystack', purchase, registration);

  const data = await fetchJson(
    'https://api.paystack.co/transaction/initialize',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gateway.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: registration.attendee_email,
        amount: decimalToCents(purchase.expected_amount_usd),
        currency: 'USD',
        reference: purchase.merchant_reference,
        callback_url: urls.returnUrl,
        metadata: {
          purpose: 'webinar_registration',
          webinar_id: Number(purchase.webinar_id),
          registration_id: Number(purchase.registration_id),
        },
      }),
    }
  );

  if (!data?.status || !data?.data?.authorization_url) {
    throw new Error(data?.message || 'Paystack did not return a checkout URL.');
  }

  return {
    checkoutUrl: data.data.authorization_url,
    providerReference: String(
      data.data.reference || purchase.merchant_reference
    ),
    providerTransactionId: null,
    raw: data,
  };
}

async function initializeFlutterwave({ gateway, purchase, registration }) {
  const urls = callbackUrls('flutterwave', purchase, registration);

  const data = await fetchJson(
    'https://api.flutterwave.com/v3/payments',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gateway.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: purchase.merchant_reference,
        amount: moneyString(purchase.expected_amount_usd),
        currency: 'USD',
        redirect_url: urls.returnUrl,
        customer: {
          email: registration.attendee_email,
          name: registration.attendee_name || 'Bloggad Webinar Attendee',
        },
        customizations: {
          title: 'Bloggad Webinar Registration',
          description: registration.webinar_title,
        },
        meta: {
          purpose: 'webinar_registration',
          webinar_id: Number(purchase.webinar_id),
          registration_id: Number(purchase.registration_id),
        },
      }),
    }
  );

  if (
    String(data?.status || '').toLowerCase() !== 'success' ||
    !data?.data?.link
  ) {
    throw new Error(
      data?.message || 'Flutterwave did not return a checkout URL.'
    );
  }

  return {
    checkoutUrl: data.data.link,
    providerReference: purchase.merchant_reference,
    providerTransactionId: null,
    raw: data,
  };
}

async function initializePayPal({ gateway, purchase, registration }) {
  const urls = callbackUrls('paypal', purchase, registration);

  const data = await paypalJson(gateway, '/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'PayPal-Request-Id': purchase.merchant_reference,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: purchase.merchant_reference,
          custom_id: purchase.merchant_reference,
          description: registration.webinar_title,
          amount: {
            currency_code: 'USD',
            value: moneyString(purchase.expected_amount_usd),
          },
        },
      ],
      application_context: {
        return_url: urls.returnUrl,
        cancel_url: urls.cancelUrl,
        brand_name: 'Bloggad',
        user_action: 'PAY_NOW',
      },
    }),
  });

  const approval = Array.isArray(data?.links)
    ? data.links.find((item) => item?.rel === 'approve')
    : null;

  if (!data?.id || !approval?.href) {
    throw new Error('PayPal did not return an approval URL.');
  }

  return {
    checkoutUrl: approval.href,
    providerReference: String(data.id),
    providerTransactionId: null,
    raw: data,
  };
}

async function getWebinarRegistrationCheckoutOptions() {
  return getReaderSubscriptionCheckoutOptions();
}

async function initializeWebinarRegistrationPurchase({
  registrationToken,
  provider: providerValue,
}) {
  const provider = normalizeProvider(providerValue);

  if (!provider) {
    const error = new Error('Select a supported payment gateway.');
    error.status = 400;
    throw error;
  }

  const registration = await loadRegistrationByToken(registrationToken);

  if (!registration) {
    const error = new Error('Webinar registration not found.');
    error.status = 404;
    throw error;
  }

  if (
    registration.registration_mode !== 'paid' ||
    Number(registration.ticket_price_usd || 0) <= 0
  ) {
    const error = new Error('This webinar registration does not require payment.');
    error.status = 409;
    throw error;
  }

  if (
    registration.status === 'confirmed' &&
    registration.payment_status === 'paid'
  ) {
    const error = new Error('This webinar registration is already paid.');
    error.status = 409;
    throw error;
  }

  const gateway = await getGatewayCredentials(provider);

  await pool.query(
    `
    UPDATE webinar_registration_purchases
    SET status = 'cancelled', updated_at = NOW()
    WHERE registration_id = ?
      AND status = 'pending'
    `,
    [registration.id]
  );

  const reference = merchantReference(registration.id);
  const amount = moneyString(registration.ticket_price_usd);

  const [result] = await pool.query(
    `
    INSERT INTO webinar_registration_purchases (
      registration_id,
      webinar_id,
      session_id,
      provider,
      gateway_mode,
      merchant_reference,
      expected_amount_usd,
      currency_code,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'USD', 'pending', NOW(), NOW())
    `,
    [
      registration.id,
      registration.webinar_id,
      registration.session_id || null,
      provider,
      gateway.mode,
      reference,
      amount,
    ]
  );

  let purchase = await loadPurchaseByReference(reference);

  try {
    let initialized;

    if (provider === 'paystack') {
      initialized = await initializePaystack({
        gateway,
        purchase,
        registration,
      });
    } else if (provider === 'flutterwave') {
      initialized = await initializeFlutterwave({
        gateway,
        purchase,
        registration,
      });
    } else {
      initialized = await initializePayPal({
        gateway,
        purchase,
        registration,
      });
    }

    await pool.query(
      `
      UPDATE webinar_registration_purchases
      SET
        provider_reference = ?,
        provider_transaction_id = ?,
        checkout_url = ?,
        gateway_response_json = ?,
        failure_reason = NULL,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        initialized.providerReference || null,
        initialized.providerTransactionId || null,
        initialized.checkoutUrl,
        JSON.stringify(initialized.raw || {}),
        result.insertId,
      ]
    );

    await pool.query(
      `
      UPDATE webinar_registrations
      SET
        status = 'pending',
        payment_status = 'pending',
        updated_at = NOW()
      WHERE id = ?
        AND payment_status <> 'paid'
      `,
      [registration.id]
    );

    purchase = await loadPurchaseByReference(reference);

    return {
      purchase: sanitizePurchase(purchase),
      checkout_url: initialized.checkoutUrl,
    };
  } catch (error) {
    await pool.query(
      `
      UPDATE webinar_registration_purchases
      SET
        status = 'failed',
        failure_reason = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [cleanFailure(error), result.insertId]
    );

    throw error;
  }
}

async function activateVerifiedPurchase({ purchase, verification }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[lockedPurchase]] = await connection.query(
      `
      SELECT *
      FROM webinar_registration_purchases
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [purchase.id]
    );

    if (!lockedPurchase) {
      throw new Error(
        'Webinar registration purchase disappeared during verification.'
      );
    }

    if (lockedPurchase.status === 'paid') {
      await connection.commit();
      return loadPurchaseByReference(lockedPurchase.merchant_reference);
    }

    const [[registration]] = await connection.query(
      `
      SELECT *
      FROM webinar_registrations
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [lockedPurchase.registration_id]
    );

    if (!registration) {
      throw new Error(
        'Webinar registration disappeared during verification.'
      );
    }

    const providerReference =
      verification.providerReference || lockedPurchase.merchant_reference;

    await connection.query(
      `
      UPDATE webinar_registration_purchases
      SET
        status = 'paid',
        provider_reference = ?,
        provider_transaction_id = ?,
        gateway_response_json = ?,
        failure_reason = NULL,
        paid_at = COALESCE(paid_at, NOW()),
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        providerReference,
        verification.providerTransactionId || null,
        JSON.stringify(verification.raw || {}),
        lockedPurchase.id,
      ]
    );

    await connection.query(
      `
      UPDATE webinar_registrations
      SET
        status = 'confirmed',
        payment_status = 'paid',
        confirmed_at = COALESCE(confirmed_at, NOW()),
        updated_at = NOW()
      WHERE id = ?
      `,
      [registration.id]
    );

    await connection.commit();

    return loadPurchaseByReference(lockedPurchase.merchant_reference);
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function reconcileWebinarRegistrationPurchase(
  merchantReferenceValue,
  {
    providerHint = null,
    flutterwaveTransactionId = null,
    paypalOrderToken = null,
  } = {}
) {
  const reference = String(merchantReferenceValue || '').trim();

  if (!reference) {
    throw new Error('Webinar registration purchase reference is required.');
  }

  let purchase = await loadPurchaseByReference(reference);

  if (!purchase) {
    throw new Error('Webinar registration purchase not found.');
  }

  if (['paid', 'cancelled'].includes(String(purchase.status))) {
    return purchase;
  }

  const provider = normalizeProvider(providerHint || purchase.provider);

  if (!provider || provider !== normalizeProvider(purchase.provider)) {
    throw new Error('Payment gateway does not match this purchase.');
  }

  const gateway = await getGatewayCredentials(provider, {
    requireEnabled: false,
    modeOverride: purchase.gateway_mode,
  });

  let verification;

  try {
    if (provider === 'paystack') {
      verification = await verifyPaystack({ gateway, purchase });
    } else if (provider === 'flutterwave') {
      verification = await verifyFlutterwave({
        gateway,
        purchase,
        transactionId: flutterwaveTransactionId,
      });
    } else {
      verification = await verifyPayPal({
        gateway,
        purchase,
        orderToken: paypalOrderToken,
      });
    }
  } catch (error) {
    await pool.query(
      `
      UPDATE webinar_registration_purchases
      SET failure_reason = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [cleanFailure(error), purchase.id]
    );
    throw error;
  }

  const expectedCents = decimalToCents(purchase.expected_amount_usd);

  if (
    !verification.success ||
    verification.amountCents === null ||
    expectedCents === null ||
    verification.amountCents < expectedCents ||
    verification.currency !== 'USD' ||
    verification.merchantReference !== purchase.merchant_reference
  ) {
    await pool.query(
      `
      UPDATE webinar_registration_purchases
      SET
        status = 'failed',
        gateway_response_json = ?,
        failure_reason = 'Verified payment did not match the expected webinar registration purchase.',
        updated_at = NOW()
      WHERE id = ?
      `,
      [JSON.stringify(verification.raw || {}), purchase.id]
    );

    await pool.query(
      `
      UPDATE webinar_registrations
      SET
        status = 'pending',
        payment_status = 'failed',
        updated_at = NOW()
      WHERE id = ?
        AND payment_status <> 'paid'
      `,
      [purchase.registration_id]
    );

    return loadPurchaseByReference(reference);
  }

  purchase = await activateVerifiedPurchase({
    purchase,
    verification,
  });

  return purchase;
}

async function markWebinarRegistrationPurchaseCancelled(referenceValue) {
  const reference = String(referenceValue || '').trim();

  if (!reference) {
    throw new Error('Webinar registration purchase reference is required.');
  }

  const purchase = await loadPurchaseByReference(reference);

  if (!purchase) {
    throw new Error('Webinar registration purchase not found.');
  }

  await pool.query(
    `
    UPDATE webinar_registration_purchases
    SET
      status = CASE WHEN status = 'paid' THEN status ELSE 'cancelled' END,
      updated_at = NOW()
    WHERE id = ?
    `,
    [purchase.id]
  );

  await pool.query(
    `
    UPDATE webinar_registrations
    SET
      payment_status = CASE
        WHEN payment_status = 'paid' THEN payment_status
        ELSE 'cancelled'
      END,
      updated_at = NOW()
    WHERE id = ?
    `,
    [purchase.registration_id]
  );

  return loadPurchaseByReference(reference);
}

module.exports = {
  getWebinarRegistrationCheckoutOptions,
  initializeWebinarRegistrationPurchase,
  reconcileWebinarRegistrationPurchase,
  markWebinarRegistrationPurchaseCancelled,
  loadPurchaseByReference,
  sanitizePurchase,
};
