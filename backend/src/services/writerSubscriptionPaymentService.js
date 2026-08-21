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

const PROVIDERS = {
  paystack: 'Paystack',
  flutterwave: 'Flutterwave',
  paypal: 'PayPal',
};

function positiveInt(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function normalizeProvider(value) {
  const provider = String(value || '').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(PROVIDERS, provider)
    ? provider
    : null;
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

function callbackUrls(provider, merchantReference) {
  const origin = frontendOrigin();
  const encoded = encodeURIComponent(merchantReference);
  const base = `${origin}/api/affiliate/subscription/checkout`;

  if (provider === 'paypal') {
    return {
      returnUrl: `${base}/callback/paypal?purchase_ref=${encoded}`,
      cancelUrl: `${base}/cancel/paypal?purchase_ref=${encoded}`,
    };
  }

  return {
    returnUrl: `${base}/callback/${provider}`,
    cancelUrl: `${origin}/writer/plan?writer_subscription_payment=cancelled&purchase_ref=${encoded}`,
  };
}

function merchantReference(writerUserId) {
  return [
    'BGW',
    Number(writerUserId),
    Date.now().toString(36).toUpperCase(),
    crypto.randomBytes(6).toString('hex').toUpperCase(),
  ].join('-');
}

async function loadWriter(writerUserId) {
  const [rows] = await pool.query(
    `
    SELECT id, email, name
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [writerUserId]
  );

  const writer = rows[0] || null;

  if (!writer) {
    const error = new Error('Writer account was not found.');
    error.status = 404;
    throw error;
  }

  if (!String(writer.email || '').trim()) {
    const error = new Error('Writer account requires an email address for payment checkout.');
    error.status = 400;
    throw error;
  }

  return writer;
}

async function loadPlan(planId) {
  const cleanPlanId = positiveInt(planId);

  if (!cleanPlanId) {
    const error = new Error('Valid Writer plan id is required.');
    error.status = 400;
    throw error;
  }

  const [rows] = await pool.query(
    `
    SELECT id, name, price, billing_cycle, status
    FROM subscription_plans
    WHERE id = ?
    LIMIT 1
    `,
    [cleanPlanId]
  );

  const plan = rows[0] || null;

  if (!plan || String(plan.status) !== 'active') {
    const error = new Error('Selected Writer plan was not found or is inactive.');
    error.status = 404;
    throw error;
  }

  if (!moneyString(plan.price) || decimalToCents(plan.price) <= 0) {
    const error = new Error('Selected Writer plan does not have a valid paid price.');
    error.status = 400;
    throw error;
  }

  if (String(plan.billing_cycle || '').toLowerCase() !== 'yearly') {
    const error = new Error('Writer checkout currently requires a yearly billing plan.');
    error.status = 400;
    throw error;
  }

  return plan;
}

async function loadPurchaseByReference(reference, connection = pool) {
  const cleanReference = String(reference || '').trim();

  if (!cleanReference) {
    return null;
  }

  const [rows] = await connection.query(
    `
    SELECT
      wsp.*,
      p.name AS plan_name,
      p.billing_cycle,
      p.price AS plan_price
    FROM writer_subscription_purchases wsp
    INNER JOIN subscription_plans p
      ON p.id = wsp.plan_id
    WHERE wsp.merchant_reference = ?
    LIMIT 1
    `,
    [cleanReference]
  );

  return rows[0] || null;
}

function sanitizePurchase(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    writer_user_id: Number(row.writer_user_id),
    plan_id: Number(row.plan_id),
    plan_name: row.plan_name || null,
    billing_cycle: row.billing_cycle || null,
    expected_amount_usd: moneyString(row.expected_amount_usd),
    currency_code: String(row.currency_code || 'USD').toUpperCase(),
    provider: row.provider,
    gateway_mode: row.gateway_mode,
    merchant_reference: row.merchant_reference,
    provider_reference: row.provider_reference || null,
    provider_transaction_id: row.provider_transaction_id || null,
    status: row.status,
    checkout_url: row.checkout_url || null,
    failure_reason: row.failure_reason || null,
    subscription_id: row.subscription_id ? Number(row.subscription_id) : null,
    paid_at: row.paid_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function initializePaystack({ gateway, purchase, writer, plan }) {
  const urls = callbackUrls('paystack', purchase.merchant_reference);

  const data = await fetchJson(
    'https://api.paystack.co/transaction/initialize',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gateway.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: writer.email,
        amount: decimalToCents(purchase.expected_amount_usd),
        currency: 'USD',
        reference: purchase.merchant_reference,
        callback_url: urls.returnUrl,
        metadata: {
          purpose: 'writer_subscription',
          writer_user_id: Number(purchase.writer_user_id),
          plan_id: Number(plan.id),
          billing_cycle: plan.billing_cycle,
        },
      }),
    }
  );

  if (!data?.status || !data?.data?.authorization_url) {
    throw new Error(data?.message || 'Paystack did not return a checkout URL.');
  }

  return {
    checkoutUrl: data.data.authorization_url,
    providerReference:
      String(data.data.reference || purchase.merchant_reference),
    providerTransactionId: null,
    raw: data,
  };
}

async function initializeFlutterwave({ gateway, purchase, writer, plan }) {
  const urls = callbackUrls('flutterwave', purchase.merchant_reference);

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
          email: writer.email,
          name: writer.name || 'Bloggad Writer',
        },
        customizations: {
          title: 'Bloggad Writer Plan',
          description: `${plan.name} Writer subscription`,
        },
        meta: {
          purpose: 'writer_subscription',
          writer_user_id: Number(purchase.writer_user_id),
          plan_id: Number(plan.id),
        },
      }),
    }
  );

  if (String(data?.status || '').toLowerCase() !== 'success' || !data?.data?.link) {
    throw new Error(data?.message || 'Flutterwave did not return a checkout URL.');
  }

  return {
    checkoutUrl: data.data.link,
    providerReference: purchase.merchant_reference,
    providerTransactionId: null,
    raw: data,
  };
}

async function initializePayPal({ gateway, purchase, plan }) {
  const urls = callbackUrls('paypal', purchase.merchant_reference);

  const data = await paypalJson(
    gateway,
    '/v2/checkout/orders',
    {
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
            description: `${plan.name} Writer subscription`,
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
    }
  );

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

async function getWriterSubscriptionCheckoutOptions() {
  return getReaderSubscriptionCheckoutOptions();
}

async function initializeWriterSubscriptionPurchase({
  writerUserId,
  planId,
  provider: providerValue,
}) {
  const provider = normalizeProvider(providerValue);

  if (!provider) {
    const error = new Error('Select a supported payment gateway.');
    error.status = 400;
    throw error;
  }

  const [writer, plan, gateway] = await Promise.all([
    loadWriter(writerUserId),
    loadPlan(planId),
    getGatewayCredentials(provider),
  ]);

  const reference = merchantReference(writer.id);
  const amount = moneyString(plan.price);

  const [result] = await pool.query(
    `
    INSERT INTO writer_subscription_purchases (
      writer_user_id,
      plan_id,
      provider,
      gateway_mode,
      merchant_reference,
      expected_amount_usd,
      currency_code,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 'USD', 'pending', NOW(), NOW())
    `,
    [
      writer.id,
      plan.id,
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
        writer,
        plan,
      });
    } else if (provider === 'flutterwave') {
      initialized = await initializeFlutterwave({
        gateway,
        purchase,
        writer,
        plan,
      });
    } else {
      initialized = await initializePayPal({
        gateway,
        purchase,
        plan,
      });
    }

    await pool.query(
      `
      UPDATE writer_subscription_purchases
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

    purchase = await loadPurchaseByReference(reference);

    return {
      purchase: sanitizePurchase(purchase),
      checkout_url: initialized.checkoutUrl,
    };
  } catch (error) {
    await pool.query(
      `
      UPDATE writer_subscription_purchases
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

async function activateVerifiedWriterPurchase({
  purchase,
  verification,
  gateway,
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [lockedRows] = await connection.query(
      `
      SELECT *
      FROM writer_subscription_purchases
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [purchase.id]
    );

    const locked = lockedRows[0] || null;

    if (!locked) {
      throw new Error('Writer subscription purchase disappeared during verification.');
    }

    if (String(locked.status) === 'paid') {
      await connection.commit();
      return loadPurchaseByReference(locked.merchant_reference);
    }

    if (String(locked.status) === 'cancelled') {
      await connection.commit();
      return loadPurchaseByReference(locked.merchant_reference);
    }

    const [subscriptionResult] = await connection.query(
      `
      INSERT INTO affiliate_subscriptions (
        user_id,
        plan_id,
        trial_start,
        trial_end,
        start_date,
        end_date,
        status,
        amount_paid,
        created_at,
        updated_at
      )
      VALUES (?, ?, NULL, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 'active', ?, NOW(), NOW())
      `,
      [
        Number(locked.writer_user_id),
        Number(locked.plan_id),
        moneyString(locked.expected_amount_usd),
      ]
    );

    const providerReference =
      verification.providerReference || locked.merchant_reference;

    await connection.query(
      `
      UPDATE writer_subscription_purchases
      SET
        status = 'paid',
        provider_reference = ?,
        provider_transaction_id = ?,
        gateway_response_json = ?,
        failure_reason = NULL,
        subscription_id = ?,
        paid_at = COALESCE(paid_at, NOW()),
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        providerReference,
        verification.providerTransactionId || null,
        JSON.stringify(verification.raw || {}),
        subscriptionResult.insertId,
        locked.id,
      ]
    );

    await connection.commit();

    return loadPurchaseByReference(locked.merchant_reference);
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    throw error;
  } finally {
    connection.release();
  }
}

async function reconcileWriterSubscriptionPurchase(
  merchantReferenceValue,
  {
    providerHint = null,
    flutterwaveTransactionId = null,
    paypalOrderToken = null,
  } = {}
) {
  const reference = String(merchantReferenceValue || '').trim();

  if (!reference) {
    throw new Error('Writer subscription purchase reference is required.');
  }

  let purchase = await loadPurchaseByReference(reference);

  if (!purchase) {
    throw new Error('Writer subscription purchase not found.');
  }

  if (['paid', 'cancelled'].includes(String(purchase.status))) {
    return sanitizePurchase(purchase);
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
      UPDATE writer_subscription_purchases
      SET
        failure_reason = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [cleanFailure(error), purchase.id]
    );

    throw error;
  }

  const expectedCents = decimalToCents(purchase.expected_amount_usd);

  if (!verification.success) {
    await pool.query(
      `
      UPDATE writer_subscription_purchases
      SET
        status = 'failed',
        gateway_response_json = ?,
        failure_reason = 'Payment was not verified as successful.',
        updated_at = NOW()
      WHERE id = ?
      `,
      [JSON.stringify(verification.raw || {}), purchase.id]
    );

    return sanitizePurchase(await loadPurchaseByReference(reference));
  }

  if (
    verification.amountCents === null ||
    expectedCents === null ||
    verification.amountCents < expectedCents ||
    verification.currency !== 'USD' ||
    verification.merchantReference !== purchase.merchant_reference
  ) {
    await pool.query(
      `
      UPDATE writer_subscription_purchases
      SET
        status = 'failed',
        gateway_response_json = ?,
        failure_reason = 'Verified payment did not match the expected Writer subscription purchase.',
        updated_at = NOW()
      WHERE id = ?
      `,
      [JSON.stringify(verification.raw || {}), purchase.id]
    );

    return sanitizePurchase(await loadPurchaseByReference(reference));
  }

  purchase = await activateVerifiedWriterPurchase({
    purchase,
    verification,
    gateway,
  });

  return sanitizePurchase(purchase);
}

async function getWriterSubscriptionPurchaseStatus({
  writerUserId,
  merchantReference,
}) {
  const purchase = await loadPurchaseByReference(merchantReference);

  if (
    !purchase ||
    Number(purchase.writer_user_id) !== Number(writerUserId)
  ) {
    throw new Error('Writer subscription purchase not found.');
  }

  return sanitizePurchase(purchase);
}

async function markWriterSubscriptionPurchaseCancelled(merchantReference) {
  const reference = String(merchantReference || '').trim();

  if (!reference) {
    throw new Error('Writer subscription purchase reference is required.');
  }

  await pool.query(
    `
    UPDATE writer_subscription_purchases
    SET
      status = CASE WHEN status = 'paid' THEN status ELSE 'cancelled' END,
      updated_at = NOW()
    WHERE merchant_reference = ?
    `,
    [reference]
  );

  return sanitizePurchase(await loadPurchaseByReference(reference));
}

module.exports = {
  getWriterSubscriptionCheckoutOptions,
  initializeWriterSubscriptionPurchase,
  reconcileWriterSubscriptionPurchase,
  getWriterSubscriptionPurchaseStatus,
  markWriterSubscriptionPurchaseCancelled,
};
