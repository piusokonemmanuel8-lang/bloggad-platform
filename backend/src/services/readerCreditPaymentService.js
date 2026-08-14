const crypto = require('crypto');
const pool = require('../config/db');
const { creditReaderWallet } = require('./writerReaderFinanceService');
const {
  encryptCredential,
  decryptCredential,
} = require('./paymentCredentialService');

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

function amountToCents(value) {
  const raw = String(value ?? '').trim();

  if (!/^\d+(?:\.\d+)?$/.test(raw)) {
    return null;
  }

  const [whole, fraction = ''] = raw.split('.');
  const centsPart = fraction.slice(0, 2).padEnd(2, '0');

  return BigInt(whole) * 100n + BigInt(centsPart || '0');
}

function centsToString(value) {
  const cents = BigInt(value);
  const whole = cents / 100n;
  const fraction = String(cents % 100n).padStart(2, '0');
  return `${whole}.${fraction}`;
}

function priceCreditsInCents(credits, creditsPerUsd) {
  const creditCount = BigInt(credits);
  const rate = BigInt(creditsPerUsd);

  if (creditCount <= 0n || rate <= 0n) {
    throw new Error('Invalid Reader credit pricing configuration.');
  }

  return (creditCount * 100n + rate - 1n) / rate;
}

function cleanFailure(error) {
  return String(error?.message || error || 'Payment request failed.')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function publicFrontendOrigin() {
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

function callbackUrl(provider, merchantReference) {
  const origin = publicFrontendOrigin();
  const encoded = encodeURIComponent(merchantReference);

  if (provider === 'paypal') {
    return {
      returnUrl:
        `${origin}/api/reader/credits/top-up/callback/paypal` +
        `?purchase_ref=${encoded}`,
      cancelUrl:
        `${origin}/api/reader/credits/top-up/cancel/paypal` +
        `?purchase_ref=${encoded}`,
    };
  }

  return {
    returnUrl:
      `${origin}/api/reader/credits/top-up/callback/${provider}`,
    cancelUrl: `${origin}/reader/credits?topup=cancelled`,
  };
}

function configuredForProvider(row, mode) {
  const prefix = mode === 'live' ? 'live' : 'test';
  const publicConfigured = Boolean(row?.[`${prefix}_public_key_encrypted`]);
  const secretConfigured = Boolean(row?.[`${prefix}_secret_key_encrypted`]);

  if (row?.provider_key === 'paypal') {
    return publicConfigured && secretConfigured;
  }

  return secretConfigured;
}

function sanitizeGatewayRow(row) {
  const activeMode = row.active_mode === 'live' ? 'live' : 'test';

  return {
    provider: row.provider_key,
    display_name: row.display_name || PROVIDERS[row.provider_key] || row.provider_key,
    enabled: Number(row.enabled || 0) === 1,
    active_mode: activeMode,
    configured: configuredForProvider(row, activeMode),
    test_public_configured: Boolean(row.test_public_key_encrypted),
    test_secret_configured: Boolean(row.test_secret_key_encrypted),
    live_public_configured: Boolean(row.live_public_key_encrypted),
    live_secret_configured: Boolean(row.live_secret_key_encrypted),
  };
}

async function getPurchaseSettings(connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      enabled,
      credits_per_usd,
      currency_code,
      quick_option_one_credits,
      quick_option_two_credits,
      minimum_credits,
      maximum_credits,
      updated_by,
      created_at,
      updated_at
    FROM reader_credit_purchase_settings
    WHERE id = 1
    LIMIT 1
    `
  );

  if (!rows[0]) {
    throw new Error('Reader credit purchase settings are not configured.');
  }

  return {
    id: Number(rows[0].id),
    enabled: Number(rows[0].enabled || 0) === 1,
    credits_per_usd: Number(rows[0].credits_per_usd || 0),
    currency_code: String(rows[0].currency_code || 'USD').toUpperCase(),
    quick_option_one_credits: Number(rows[0].quick_option_one_credits || 0),
    quick_option_two_credits: Number(rows[0].quick_option_two_credits || 0),
    minimum_credits: Number(rows[0].minimum_credits || 0),
    maximum_credits: Number(rows[0].maximum_credits || 0),
    updated_by: rows[0].updated_by ? Number(rows[0].updated_by) : null,
    created_at: rows[0].created_at,
    updated_at: rows[0].updated_at,
  };
}

async function getGatewayRows(connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      id,
      provider_key,
      display_name,
      enabled,
      active_mode,
      test_public_key_encrypted,
      test_secret_key_encrypted,
      live_public_key_encrypted,
      live_secret_key_encrypted,
      updated_by,
      created_at,
      updated_at
    FROM payment_gateway_settings
    WHERE provider_key IN ('paystack', 'flutterwave', 'paypal')
    ORDER BY FIELD(provider_key, 'paystack', 'flutterwave', 'paypal')
    `
  );

  return rows;
}

async function getReaderCreditTopUpOptions() {
  const settings = await getPurchaseSettings();
  const gatewayRows = await getGatewayRows();

  return {
    settings,
    gateways: gatewayRows
      .map(sanitizeGatewayRow)
      .filter((gateway) => gateway.enabled && gateway.configured),
  };
}

async function getGatewayCredentials(
  providerValue,
  { requireEnabled = true, modeOverride = null } = {}
) {
  const provider = normalizeProvider(providerValue);

  if (!provider) {
    throw new Error('Unsupported payment gateway.');
  }

  const [rows] = await pool.query(
    `
    SELECT *
    FROM payment_gateway_settings
    WHERE provider_key = ?
    LIMIT 1
    `,
    [provider]
  );

  const row = rows[0];

  if (!row) {
    throw new Error('Payment gateway is not configured.');
  }

  if (requireEnabled && Number(row.enabled || 0) !== 1) {
    throw new Error(`${PROVIDERS[provider]} is currently disabled.`);
  }

  const mode =
    modeOverride === 'live' || modeOverride === 'test'
      ? modeOverride
      : row.active_mode === 'live'
        ? 'live'
        : 'test';

  if (!configuredForProvider(row, mode)) {
    throw new Error(`${PROVIDERS[provider]} ${mode} credentials are incomplete.`);
  }

  const prefix = mode === 'live' ? 'live' : 'test';

  return {
    provider,
    displayName: row.display_name || PROVIDERS[provider],
    mode,
    publicKey: decryptCredential(row[`${prefix}_public_key_encrypted`]),
    secretKey: decryptCredential(row[`${prefix}_secret_key_encrypted`]),
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Payment gateway request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function requestJson(url, options = {}, timeoutMs = 20000) {
  const response = await fetchWithTimeout(url, options, timeoutMs);
  const text = await response.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error_description ||
      data?.error ||
      `Payment gateway returned HTTP ${response.status}.`;

    throw new Error(String(message).slice(0, 400));
  }

  return data;
}

async function initializePaystack({
  gateway,
  merchantReference,
  amountCents,
  reader,
}) {
  const urls = callbackUrl('paystack', merchantReference);
  const data = await requestJson(
    'https://api.paystack.co/transaction/initialize',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gateway.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: reader.email,
        amount: String(amountCents),
        currency: 'USD',
        reference: merchantReference,
        callback_url: urls.returnUrl,
        metadata: {
          purpose: 'reader_credit_purchase',
          reader_user_id: reader.id,
          merchant_reference: merchantReference,
        },
      }),
    }
  );

  if (!data?.status || !data?.data?.authorization_url) {
    throw new Error(data?.message || 'Paystack did not return a checkout URL.');
  }

  return {
    checkoutUrl: data.data.authorization_url,
    providerReference: String(data.data.reference || merchantReference),
    providerTransactionId: null,
    snapshot: {
      status: Boolean(data.status),
      reference: String(data.data.reference || merchantReference),
    },
  };
}

async function verifyPaystack({ gateway, purchase }) {
  const data = await requestJson(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(
      purchase.merchant_reference
    )}`,
    {
      headers: {
        Authorization: `Bearer ${gateway.secretKey}`,
      },
    }
  );

  const item = data?.data || {};
  const amountCents = amountToCents(
    item.amount === null || item.amount === undefined
      ? ''
      : centsToString(BigInt(String(item.amount)))
  );

  return {
    success:
      Boolean(data?.status) &&
      String(item.status || '').toLowerCase() === 'success' &&
      String(item.reference || '') === String(purchase.merchant_reference),
    terminalFailure:
      ['failed', 'abandoned', 'reversed'].includes(
        String(item.status || '').toLowerCase()
      ),
    amountCents,
    currency: String(item.currency || '').toUpperCase(),
    providerReference: String(item.reference || purchase.merchant_reference),
    providerTransactionId:
      item.id === null || item.id === undefined ? null : String(item.id),
    snapshot: {
      status: item.status || null,
      reference: item.reference || null,
      id: item.id || null,
      amount: item.amount || null,
      currency: item.currency || null,
    },
  };
}

async function initializeFlutterwave({
  gateway,
  merchantReference,
  amountString,
  reader,
}) {
  const urls = callbackUrl('flutterwave', merchantReference);
  const data = await requestJson(
    'https://api.flutterwave.com/v3/payments',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${gateway.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: merchantReference,
        amount: amountString,
        currency: 'USD',
        redirect_url: urls.returnUrl,
        customer: {
          email: reader.email,
          name: reader.name,
        },
        customizations: {
          title: 'Bloggad Reader Credits',
          description: `${merchantReference} Reader credit purchase`,
        },
        meta: {
          purpose: 'reader_credit_purchase',
          reader_user_id: reader.id,
          merchant_reference: merchantReference,
        },
      }),
    }
  );

  if (
    String(data?.status || '').toLowerCase() !== 'success' ||
    !data?.data?.link
  ) {
    throw new Error(data?.message || 'Flutterwave did not return a checkout URL.');
  }

  return {
    checkoutUrl: data.data.link,
    providerReference: null,
    providerTransactionId: null,
    snapshot: {
      status: data.status || null,
      message: data.message || null,
    },
  };
}

async function verifyFlutterwave({
  gateway,
  purchase,
  transactionId = null,
}) {
  const url = transactionId
    ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
        transactionId
      )}/verify`
    : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
        purchase.merchant_reference
      )}`;

  const data = await requestJson(url, {
    headers: {
      Authorization: `Bearer ${gateway.secretKey}`,
      'Content-Type': 'application/json',
    },
  });

  const item = data?.data || {};
  const status = String(item.status || '').toLowerCase();

  return {
    success:
      String(data?.status || '').toLowerCase() === 'success' &&
      status === 'successful' &&
      String(item.tx_ref || '') === String(purchase.merchant_reference),
    terminalFailure: ['failed', 'cancelled'].includes(status),
    amountCents: amountToCents(item.amount),
    currency: String(item.currency || '').toUpperCase(),
    providerReference:
      item.id === null || item.id === undefined ? null : String(item.id),
    providerTransactionId:
      item.id === null || item.id === undefined ? null : String(item.id),
    snapshot: {
      status: item.status || null,
      tx_ref: item.tx_ref || null,
      id: item.id || null,
      amount: item.amount || null,
      currency: item.currency || null,
    },
  };
}

function paypalBaseUrl(mode) {
  return mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken(gateway) {
  const response = await fetchWithTimeout(
    `${paypalBaseUrl(gateway.mode)}/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            `${gateway.publicKey}:${gateway.secretKey}`,
            'utf8'
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: 'grant_type=client_credentials',
    }
  );

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok || !data?.access_token) {
    throw new Error(
      data?.error_description ||
        data?.error ||
        'PayPal authentication failed.'
    );
  }

  return data.access_token;
}

async function paypalJson(gateway, path, options = {}) {
  const token = await getPayPalAccessToken(gateway);

  return requestJson(
    `${paypalBaseUrl(gateway.mode)}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Prefer: 'return=representation',
        ...(options.headers || {}),
      },
    },
    25000
  );
}

async function initializePayPal({
  gateway,
  merchantReference,
  amountString,
}) {
  const urls = callbackUrl('paypal', merchantReference);
  const data = await paypalJson(
    gateway,
    '/v2/checkout/orders',
    {
      method: 'POST',
      headers: {
        'PayPal-Request-Id': merchantReference,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: merchantReference,
            custom_id: merchantReference,
            description: 'Bloggad Reader Credits',
            amount: {
              currency_code: 'USD',
              value: amountString,
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: 'Bloggad',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: urls.returnUrl,
              cancel_url: urls.cancelUrl,
            },
          },
        },
      }),
    }
  );

  const approveLink = Array.isArray(data?.links)
    ? data.links.find((item) => item?.rel === 'approve')?.href
    : null;

  if (!data?.id || !approveLink) {
    throw new Error('PayPal did not return an approval URL.');
  }

  return {
    checkoutUrl: approveLink,
    providerReference: String(data.id),
    providerTransactionId: null,
    snapshot: {
      id: data.id,
      status: data.status || null,
    },
  };
}

function paypalCaptureFromOrder(order) {
  const units = Array.isArray(order?.purchase_units)
    ? order.purchase_units
    : [];

  for (const unit of units) {
    const captures = Array.isArray(unit?.payments?.captures)
      ? unit.payments.captures
      : [];

    const completed =
      captures.find(
        (capture) =>
          String(capture?.status || '').toUpperCase() === 'COMPLETED'
      ) || captures[0];

    if (completed) {
      return {
        unit,
        capture: completed,
      };
    }
  }

  return {
    unit: units[0] || null,
    capture: null,
  };
}

async function verifyPayPal({
  gateway,
  purchase,
  orderToken = null,
}) {
  const orderId = String(
    purchase.provider_reference || orderToken || ''
  ).trim();

  if (!orderId) {
    return {
      success: false,
      terminalFailure: false,
      amountCents: null,
      currency: '',
      providerReference: null,
      providerTransactionId: null,
      snapshot: {
        status: 'missing_order_id',
      },
    };
  }

  if (
    purchase.provider_reference &&
    orderToken &&
    String(purchase.provider_reference) !== String(orderToken)
  ) {
    throw new Error('PayPal order token does not match this purchase.');
  }

  let order = await paypalJson(
    gateway,
    `/v2/checkout/orders/${encodeURIComponent(orderId)}`
  );

  const initialUnit = Array.isArray(order?.purchase_units)
    ? order.purchase_units[0]
    : null;

  if (
    String(initialUnit?.custom_id || initialUnit?.reference_id || '') !==
    String(purchase.merchant_reference)
  ) {
    throw new Error('PayPal order reference does not match this purchase.');
  }

  if (String(order?.status || '').toUpperCase() === 'APPROVED') {
    order = await paypalJson(
      gateway,
      `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: 'POST',
        headers: {
          'PayPal-Request-Id': `capture-${purchase.merchant_reference}`.slice(
            0,
            108
          ),
        },
        body: '{}',
      }
    );
  }

  const { unit, capture } = paypalCaptureFromOrder(order);
  const orderStatus = String(order?.status || '').toUpperCase();
  const captureStatus = String(capture?.status || '').toUpperCase();
  const amount = capture?.amount || unit?.amount || {};
  const success =
    orderStatus === 'COMPLETED' && captureStatus === 'COMPLETED';

  return {
    success,
    terminalFailure: ['VOIDED'].includes(orderStatus),
    amountCents: amountToCents(amount.value),
    currency: String(amount.currency_code || '').toUpperCase(),
    providerReference: orderId,
    providerTransactionId: capture?.id ? String(capture.id) : null,
    snapshot: {
      id: orderId,
      status: orderStatus || null,
      capture_id: capture?.id || null,
      capture_status: captureStatus || null,
      amount: amount.value || null,
      currency: amount.currency_code || null,
    },
  };
}

async function getReaderIdentity(readerUserId) {
  const [rows] = await pool.query(
    `
    SELECT id, email, name, role, status
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [readerUserId]
  );

  const user = rows[0];

  if (
    !user ||
    String(user.role || '').toLowerCase() !== 'customer' ||
    String(user.status || '').toLowerCase() !== 'active'
  ) {
    throw new Error('Active Reader account is required.');
  }

  if (!String(user.email || '').trim()) {
    throw new Error('Reader email address is required for payment.');
  }

  return {
    id: Number(user.id),
    email: String(user.email).trim(),
    name:
      String(user.name || user.email || 'Reader').trim() ||
      'Reader',
  };
}

async function loadPurchaseByReference(merchantReference) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM reader_credit_purchases
    WHERE merchant_reference = ?
    LIMIT 1
    `,
    [merchantReference]
  );

  return rows[0] || null;
}

function sanitizePurchase(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    reader_user_id: Number(row.reader_user_id),
    credits_requested: Number(row.credits_requested || 0),
    credits_issued: Number(row.credits_issued || 0),
    credits_per_usd: Number(row.credits_per_usd || 0),
    expected_amount_usd: String(row.expected_amount_usd || '0.00'),
    verified_amount_usd:
      row.verified_amount_usd === null ||
      row.verified_amount_usd === undefined
        ? null
        : String(row.verified_amount_usd),
    currency_code: String(row.currency_code || 'USD'),
    provider: String(row.provider || ''),
    gateway_mode: String(row.gateway_mode || 'test'),
    merchant_reference: String(row.merchant_reference || ''),
    status: String(row.status || ''),
    failure_reason: row.failure_reason || null,
    paid_at: row.paid_at || null,
    credited_at: row.credited_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function initializeReaderCreditPurchase({
  readerUserId,
  credits,
  provider: providerValue,
}) {
  const settings = await getPurchaseSettings();

  if (!settings.enabled) {
    throw new Error('Reader credit purchases are currently disabled.');
  }

  if (settings.currency_code !== 'USD') {
    throw new Error('Reader credit purchases currently require USD pricing.');
  }

  const creditCount = positiveInt(credits);

  if (!creditCount) {
    throw new Error('Credits must be a positive whole number.');
  }

  if (
    creditCount < settings.minimum_credits ||
    creditCount > settings.maximum_credits
  ) {
    throw new Error(
      `Credits must be between ${settings.minimum_credits} and ${settings.maximum_credits}.`
    );
  }

  const provider = normalizeProvider(providerValue);

  if (!provider) {
    throw new Error('Select a supported payment gateway.');
  }

  const reader = await getReaderIdentity(readerUserId);
  const gateway = await getGatewayCredentials(provider);
  const amountCents = priceCreditsInCents(
    creditCount,
    settings.credits_per_usd
  );
  const amountString = centsToString(amountCents);
  const merchantReference =
    `RCR-${Date.now()}-${crypto.randomBytes(12).toString('hex')}`.slice(
      0,
      120
    );

  const [insertResult] = await pool.query(
    `
    INSERT INTO reader_credit_purchases (
      reader_user_id,
      credits_requested,
      credits_issued,
      credits_per_usd,
      expected_amount_usd,
      currency_code,
      provider,
      gateway_mode,
      merchant_reference,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, 0, ?, ?, 'USD', ?, ?, ?, 'created', NOW(), NOW())
    `,
    [
      reader.id,
      creditCount,
      settings.credits_per_usd,
      amountString,
      provider,
      gateway.mode,
      merchantReference,
    ]
  );

  try {
    let initialized;

    if (provider === 'paystack') {
      initialized = await initializePaystack({
        gateway,
        merchantReference,
        amountCents,
        reader,
      });
    } else if (provider === 'flutterwave') {
      initialized = await initializeFlutterwave({
        gateway,
        merchantReference,
        amountString,
        reader,
      });
    } else {
      initialized = await initializePayPal({
        gateway,
        merchantReference,
        amountString,
        reader,
      });
    }

    await pool.query(
      `
      UPDATE reader_credit_purchases
      SET
        provider_reference = ?,
        provider_transaction_id = ?,
        status = 'initialized',
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
        JSON.stringify(initialized.snapshot || {}),
        insertResult.insertId,
      ]
    );

    return {
      purchase: sanitizePurchase(
        await loadPurchaseByReference(merchantReference)
      ),
      checkout_url: initialized.checkoutUrl,
    };
  } catch (error) {
    await pool.query(
      `
      UPDATE reader_credit_purchases
      SET
        status = 'failed',
        failure_reason = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [cleanFailure(error), insertResult.insertId]
    );

    throw error;
  }
}

async function reconcileReaderCreditPurchase(
  merchantReference,
  {
    providerHint = null,
    flutterwaveTransactionId = null,
    paypalOrderToken = null,
  } = {}
) {
  const reference = String(merchantReference || '').trim();
  if (!reference) {
    throw new Error('Reader credit purchase reference is required.');
  }

  let purchase = await loadPurchaseByReference(reference);

  if (!purchase) {
    throw new Error('Reader credit purchase not found.');
  }

  if (String(purchase.status) === 'credited') {
    return sanitizePurchase(purchase);
  }

  if (String(purchase.status) === 'cancelled') {
    return sanitizePurchase(purchase);
  }

  const provider = normalizeProvider(purchase.provider);

  if (!provider || (providerHint && providerHint !== provider)) {
    throw new Error('Payment gateway does not match this purchase.');
  }

  const gateway = await getGatewayCredentials(provider, {
    requireEnabled: false,
    modeOverride: purchase.gateway_mode,
  });

  let verification;

  try {
    if (provider === 'paystack') {
      verification = await verifyPaystack({
        gateway,
        purchase,
      });
    } else if (provider === 'flutterwave') {
      verification = await verifyFlutterwave({
        gateway,
        purchase,
        transactionId:
          flutterwaveTransactionId ||
          purchase.provider_transaction_id ||
          null,
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
      UPDATE reader_credit_purchases
      SET
        status = CASE
          WHEN status IN ('created', 'initialized', 'failed') THEN 'pending'
          ELSE status
        END,
        failure_reason = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [cleanFailure(error), purchase.id]
    );
    throw error;
  }

  const expectedCents = amountToCents(purchase.expected_amount_usd);

  if (
    verification.success &&
    verification.currency === 'USD' &&
    verification.amountCents !== null &&
    expectedCents !== null &&
    verification.amountCents >= expectedCents
  ) {
    await pool.query(
      `
      UPDATE reader_credit_purchases
      SET
        verified_amount_usd = ?,
        provider_reference = COALESCE(?, provider_reference),
        provider_transaction_id = COALESCE(?, provider_transaction_id),
        status = 'paid',
        failure_reason = NULL,
        gateway_response_json = ?,
        paid_at = COALESCE(paid_at, NOW()),
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        centsToString(verification.amountCents),
        verification.providerReference || null,
        verification.providerTransactionId || null,
        JSON.stringify(verification.snapshot || {}),
        purchase.id,
      ]
    );

    const credit = await creditReaderWallet({
      readerUserId: Number(purchase.reader_user_id),
      credits: Number(purchase.credits_requested),
      usdValue: String(purchase.expected_amount_usd),
      sourceType: 'credit_purchase',
      sourceReference: String(purchase.merchant_reference),
      createdByUserId: null,
    });

    await pool.query(
      `
      UPDATE reader_credit_purchases
      SET
        credits_issued = credits_requested,
        status = 'credited',
        credited_lot_id = ?,
        credited_transaction_id = ?,
        credited_at = COALESCE(credited_at, NOW()),
        failure_reason = NULL,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        credit.lot_id || null,
        credit.transaction_id || null,
        purchase.id,
      ]
    );

    purchase = await loadPurchaseByReference(reference);
    return sanitizePurchase(purchase);
  }

  const currencyMismatch =
    verification.currency &&
    verification.currency !== 'USD';
  const underpaid =
    verification.amountCents !== null &&
    expectedCents !== null &&
    verification.amountCents < expectedCents;

  let reason = 'Payment is not verified yet.';

  if (currencyMismatch) {
    reason = 'Verified payment currency does not match USD.';
  } else if (underpaid) {
    reason = 'Verified payment amount is below the required amount.';
  } else if (verification.terminalFailure) {
    reason = 'Payment was not completed successfully.';
  }

  const nextStatus =
    currencyMismatch || underpaid || verification.terminalFailure
      ? 'failed'
      : 'pending';

  await pool.query(
    `
    UPDATE reader_credit_purchases
    SET
      provider_reference = COALESCE(?, provider_reference),
      provider_transaction_id = COALESCE(?, provider_transaction_id),
      status = ?,
      failure_reason = ?,
      gateway_response_json = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [
      verification.providerReference || null,
      verification.providerTransactionId || null,
      nextStatus,
      reason,
      JSON.stringify(verification.snapshot || {}),
      purchase.id,
    ]
  );

  purchase = await loadPurchaseByReference(reference);
  return sanitizePurchase(purchase);
}

async function getReaderCreditPurchaseStatus({
  readerUserId,
  merchantReference,
  reconcile = true,
}) {
  const reference = String(merchantReference || '').trim();
  const purchase = await loadPurchaseByReference(reference);

  if (
    !purchase ||
    Number(purchase.reader_user_id) !== Number(readerUserId)
  ) {
    throw new Error('Reader credit purchase not found.');
  }

  if (
    reconcile &&
    !['credited', 'cancelled'].includes(String(purchase.status))
  ) {
    try {
      return await reconcileReaderCreditPurchase(reference);
    } catch {
      const fresh = await loadPurchaseByReference(reference);
      return sanitizePurchase(fresh);
    }
  }

  return sanitizePurchase(purchase);
}

async function markReaderCreditPurchaseCancelled(merchantReference) {
  const reference = String(merchantReference || '').trim();

  if (!reference) {
    throw new Error('Reader credit purchase reference is required.');
  }

  await pool.query(
    `
    UPDATE reader_credit_purchases
    SET
      status = CASE
        WHEN status IN ('credited', 'paid') THEN status
        ELSE 'cancelled'
      END,
      failure_reason = CASE
        WHEN status IN ('credited', 'paid') THEN failure_reason
        ELSE 'Payment was cancelled before completion.'
      END,
      updated_at = NOW()
    WHERE merchant_reference = ?
    `,
    [reference]
  );

  return sanitizePurchase(await loadPurchaseByReference(reference));
}

async function getAdminPaymentConfiguration() {
  const settings = await getPurchaseSettings();
  const gateways = (await getGatewayRows()).map(sanitizeGatewayRow);

  return {
    settings,
    gateways,
  };
}

async function updateGatewaySetting(providerValue, payload, adminUserId) {
  const provider = normalizeProvider(providerValue);

  if (!provider) {
    throw new Error('Unsupported payment gateway.');
  }

  const activeMode =
    payload?.active_mode === 'live' ? 'live' : 'test';
  const enabled =
    payload?.enabled === true ||
    payload?.enabled === 1 ||
    payload?.enabled === '1';

  const [rows] = await pool.query(
    `
    SELECT *
    FROM payment_gateway_settings
    WHERE provider_key = ?
    LIMIT 1
    `,
    [provider]
  );

  if (!rows[0]) {
    throw new Error('Payment gateway settings row not found.');
  }

  const fields = {
    test_public_key_encrypted: rows[0].test_public_key_encrypted,
    test_secret_key_encrypted: rows[0].test_secret_key_encrypted,
    live_public_key_encrypted: rows[0].live_public_key_encrypted,
    live_secret_key_encrypted: rows[0].live_secret_key_encrypted,
  };

  const inputMap = {
    test_public_key: 'test_public_key_encrypted',
    test_secret_key: 'test_secret_key_encrypted',
    live_public_key: 'live_public_key_encrypted',
    live_secret_key: 'live_secret_key_encrypted',
  };

  for (const [inputKey, dbKey] of Object.entries(inputMap)) {
    const raw = String(payload?.[inputKey] || '').trim();

    if (raw) {
      fields[dbKey] = encryptCredential(raw);
    }
  }

  if (payload?.clear_test_credentials === true) {
    fields.test_public_key_encrypted = null;
    fields.test_secret_key_encrypted = null;
  }

  if (payload?.clear_live_credentials === true) {
    fields.live_public_key_encrypted = null;
    fields.live_secret_key_encrypted = null;
  }

  await pool.query(
    `
    UPDATE payment_gateway_settings
    SET
      enabled = ?,
      active_mode = ?,
      test_public_key_encrypted = ?,
      test_secret_key_encrypted = ?,
      live_public_key_encrypted = ?,
      live_secret_key_encrypted = ?,
      updated_by = ?,
      updated_at = NOW()
    WHERE provider_key = ?
    `,
    [
      enabled ? 1 : 0,
      activeMode,
      fields.test_public_key_encrypted,
      fields.test_secret_key_encrypted,
      fields.live_public_key_encrypted,
      fields.live_secret_key_encrypted,
      adminUserId || null,
      provider,
    ]
  );

  const [freshRows] = await pool.query(
    `
    SELECT *
    FROM payment_gateway_settings
    WHERE provider_key = ?
    LIMIT 1
    `,
    [provider]
  );

  return sanitizeGatewayRow(freshRows[0]);
}

async function updateReaderCreditPurchaseSettings(payload, adminUserId) {
  const enabled =
    payload?.enabled === true ||
    payload?.enabled === 1 ||
    payload?.enabled === '1';

  const creditsPerUsd = positiveInt(payload?.credits_per_usd);
  const quickOne = positiveInt(payload?.quick_option_one_credits);
  const quickTwo = positiveInt(payload?.quick_option_two_credits);
  const minimum = positiveInt(payload?.minimum_credits);
  const maximum = positiveInt(payload?.maximum_credits);

  if (!creditsPerUsd || !quickOne || !quickTwo || !minimum || !maximum) {
    throw new Error('All Reader credit pricing values must be positive whole numbers.');
  }

  if (minimum > maximum) {
    throw new Error('Minimum credits cannot exceed maximum credits.');
  }

  if (
    quickOne < minimum ||
    quickOne > maximum ||
    quickTwo < minimum ||
    quickTwo > maximum
  ) {
    throw new Error('Quick credit options must stay within the configured minimum and maximum.');
  }

  await pool.query(
    `
    UPDATE reader_credit_purchase_settings
    SET
      enabled = ?,
      credits_per_usd = ?,
      currency_code = 'USD',
      quick_option_one_credits = ?,
      quick_option_two_credits = ?,
      minimum_credits = ?,
      maximum_credits = ?,
      updated_by = ?,
      updated_at = NOW()
    WHERE id = 1
    `,
    [
      enabled ? 1 : 0,
      creditsPerUsd,
      quickOne,
      quickTwo,
      minimum,
      maximum,
      adminUserId || null,
    ]
  );

  return getPurchaseSettings();
}

module.exports = {
  getReaderCreditTopUpOptions,
  initializeReaderCreditPurchase,
  reconcileReaderCreditPurchase,
  getReaderCreditPurchaseStatus,
  markReaderCreditPurchaseCancelled,
  getAdminPaymentConfiguration,
  updateGatewaySetting,
  updateReaderCreditPurchaseSettings,
};
