const crypto = require('crypto');
const pool = require('../config/db');
const { decryptCredential } = require('./paymentCredentialService');
const {
  activateReaderPlatformSubscription,
} = require('./writerReaderAccessService');

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

function decimalToCents(value) {
  const raw = String(value ?? '').trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) {
    return null;
  }

  const [whole, fraction = ''] = raw.split('.');
  return (
    Number(whole) * 100 +
    Number(fraction.slice(0, 2).padEnd(2, '0') || '0')
  );
}

function moneyString(value) {
  const cents = decimalToCents(value);
  if (cents === null) return null;
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
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

function callbackUrls(provider, merchantReference) {
  const origin = publicFrontendOrigin();
  const encoded = encodeURIComponent(merchantReference);
  const base = `${origin}/api/reader/access/checkout`;

  if (provider === 'paypal') {
    return {
      returnUrl: `${base}/callback/paypal?purchase_ref=${encoded}`,
      cancelUrl: `${base}/cancel/paypal?purchase_ref=${encoded}`,
    };
  }

  return {
    returnUrl: `${base}/callback/${provider}`,
    cancelUrl: `${origin}/reader/premium?subscription_payment=cancelled&purchase_ref=${encoded}`,
  };
}

function configuredForProvider(row, mode) {
  const prefix = mode === 'live' ? 'live' : 'test';
  const publicConfigured = Boolean(
    row?.[`${prefix}_public_key_encrypted`]
  );
  const secretConfigured = Boolean(
    row?.[`${prefix}_secret_key_encrypted`]
  );

  if (row?.provider_key === 'paypal') {
    return publicConfigured && secretConfigured;
  }

  return secretConfigured;
}

function sanitizeGatewayRow(row) {
  const mode = row.active_mode === 'live' ? 'live' : 'test';

  return {
    provider: row.provider_key,
    display_name:
      row.display_name || PROVIDERS[row.provider_key] || row.provider_key,
    enabled: Number(row.enabled || 0) === 1,
    active_mode: mode,
    configured: configuredForProvider(row, mode),
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

async function getReaderSubscriptionCheckoutOptions() {
  const rows = await getGatewayRows();

  return {
    gateways: rows
      .map(sanitizeGatewayRow)
      .filter((gateway) => gateway.enabled && gateway.configured),
  };
}

async function getGatewayCredentials(
  providerValue,
  { modeOverride = null, requireEnabled = true } = {}
) {
  const provider = normalizeProvider(providerValue);

  if (!provider) {
    throw new Error('Select a supported payment gateway.');
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
    publicKey: decryptCredential(
      row[`${prefix}_public_key_encrypted`]
    ),
    secretKey: decryptCredential(
      row[`${prefix}_secret_key_encrypted`]
    ),
  };
}

async function fetchJson(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const text = await response.text();
    let data = {};

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text.slice(0, 500) };
      }
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.error_description ||
          `Payment gateway returned HTTP ${response.status}.`
      );
    }

    return data;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Payment gateway request timed out.');
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function loadPlan(planId, connection = pool) {
  const cleanPlanId = positiveInt(planId);

  if (!cleanPlanId) {
    throw new Error('Valid Reader subscription plan is required.');
  }

  const [rows] = await connection.query(
    `
    SELECT
      id,
      name,
      tier,
      price_usd,
      billing_cycle,
      description,
      status
    FROM reader_subscription_plans
    WHERE id = ?
      AND status = 'active'
      AND tier IN ('basic', 'premium')
    LIMIT 1
    `,
    [cleanPlanId]
  );

  const plan = rows[0];

  if (!plan) {
    throw new Error('Reader subscription plan is unavailable.');
  }

  if (decimalToCents(plan.price_usd) === null || decimalToCents(plan.price_usd) <= 0) {
    throw new Error('Reader subscription plan has invalid pricing.');
  }

  return plan;
}

async function loadReaderUser(readerUserId, connection = pool) {
  const cleanReaderId = positiveInt(readerUserId);

  if (!cleanReaderId) {
    throw new Error('Valid Reader account is required.');
  }

  const [rows] = await connection.query(
    `
    SELECT id, name, email
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [cleanReaderId]
  );

  const user = rows[0];

  if (!user || !String(user.email || '').trim()) {
    throw new Error('Reader email is required for checkout.');
  }

  return user;
}

function merchantReference(readerUserId) {
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `BRSP-${Date.now()}-${readerUserId}-${random}`.slice(0, 120);
}

async function loadPurchaseByReference(reference, connection = pool) {
  const cleanReference = String(reference || '').trim();

  if (!cleanReference) {
    return null;
  }

  const [rows] = await connection.query(
    `
    SELECT
      rsp.*,
      p.name AS plan_name,
      p.tier AS plan_tier,
      p.billing_cycle,
      p.price_usd AS plan_price_usd
    FROM reader_subscription_purchases rsp
    INNER JOIN reader_subscription_plans p
      ON p.id = rsp.plan_id
    WHERE rsp.merchant_reference = ?
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
    reader_user_id: Number(row.reader_user_id),
    plan_id: Number(row.plan_id),
    plan_name: row.plan_name || null,
    plan_tier: row.plan_tier || null,
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

async function initializePaystack({
  gateway,
  purchase,
  reader,
  plan,
}) {
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
        email: reader.email,
        amount: decimalToCents(purchase.expected_amount_usd),
        currency: 'USD',
        reference: purchase.merchant_reference,
        callback_url: urls.returnUrl,
        metadata: {
          purpose: 'reader_subscription',
          reader_user_id: Number(purchase.reader_user_id),
          plan_id: Number(plan.id),
          plan_tier: plan.tier,
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

async function verifyPaystack({ gateway, purchase }) {
  const data = await fetchJson(
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

  return {
    success: String(item.status || '').toLowerCase() === 'success',
    amountCents: Number(item.amount || 0),
    currency: String(item.currency || '').toUpperCase(),
    merchantReference: String(item.reference || ''),
    providerReference: String(item.reference || purchase.merchant_reference),
    providerTransactionId: item.id ? String(item.id) : null,
    raw: data,
  };
}

async function initializeFlutterwave({
  gateway,
  purchase,
  reader,
  plan,
}) {
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
          email: reader.email,
          name: reader.name || 'Bloggad Reader',
        },
        customizations: {
          title: 'Bloggad Reader Subscription',
          description: `${plan.name} Reader subscription`,
        },
        meta: {
          purpose: 'reader_subscription',
          reader_user_id: Number(purchase.reader_user_id),
          plan_id: Number(plan.id),
          plan_tier: plan.tier,
          billing_cycle: plan.billing_cycle,
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

async function verifyFlutterwave({
  gateway,
  purchase,
  transactionId = null,
}) {
  const cleanTransactionId = String(transactionId || '').trim();
  const url = cleanTransactionId
    ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
        cleanTransactionId
      )}/verify`
    : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
        purchase.merchant_reference
      )}`;

  const data = await fetchJson(url, {
    headers: {
      Authorization: `Bearer ${gateway.secretKey}`,
    },
  });

  const item = data?.data || {};

  return {
    success:
      String(data?.status || '').toLowerCase() === 'success' &&
      String(item.status || '').toLowerCase() === 'successful',
    amountCents: decimalToCents(item.amount),
    currency: String(item.currency || '').toUpperCase(),
    merchantReference: String(item.tx_ref || ''),
    providerReference: item.id
      ? String(item.id)
      : String(item.tx_ref || purchase.merchant_reference),
    providerTransactionId: item.id ? String(item.id) : null,
    raw: data,
  };
}

function paypalBaseUrl(mode) {
  return mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken(gateway) {
  const token = Buffer.from(
    `${gateway.publicKey}:${gateway.secretKey}`,
    'utf8'
  ).toString('base64');

  const data = await fetchJson(
    `${paypalBaseUrl(gateway.mode)}/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    }
  );

  if (!data?.access_token) {
    throw new Error('PayPal authentication failed.');
  }

  return data.access_token;
}

async function paypalJson(gateway, path, options = {}) {
  const accessToken = await getPayPalAccessToken(gateway);

  return fetchJson(`${paypalBaseUrl(gateway.mode)}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

async function initializePayPal({
  gateway,
  purchase,
  plan,
}) {
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
            description: `${plan.name} Reader subscription`,
            amount: {
              currency_code: 'USD',
              value: moneyString(purchase.expected_amount_usd),
            },
          },
        ],
        application_context: {
          brand_name: 'Bloggad',
          user_action: 'PAY_NOW',
          return_url: urls.returnUrl,
          cancel_url: urls.cancelUrl,
        },
      }),
    }
  );

  const approveLink = Array.isArray(data?.links)
    ? data.links.find((link) => link?.rel === 'approve')?.href
    : null;

  if (!data?.id || !approveLink) {
    throw new Error('PayPal did not return an approval URL.');
  }

  return {
    checkoutUrl: approveLink,
    providerReference: String(data.id),
    providerTransactionId: null,
    raw: data,
  };
}

function paypalCaptureFromOrder(order) {
  const unit = Array.isArray(order?.purchase_units)
    ? order.purchase_units[0]
    : null;
  const capture = Array.isArray(unit?.payments?.captures)
    ? unit.payments.captures[0]
    : null;

  return { unit, capture };
}

async function verifyPayPal({
  gateway,
  purchase,
  orderToken = null,
}) {
  const expectedOrder = String(
    purchase.provider_reference || orderToken || ''
  ).trim();
  const suppliedOrder = String(orderToken || expectedOrder).trim();

  if (!suppliedOrder) {
    throw new Error('PayPal order token is required.');
  }

  if (expectedOrder && expectedOrder !== suppliedOrder) {
    throw new Error('PayPal order token does not match this purchase.');
  }

  let order = await paypalJson(
    gateway,
    `/v2/checkout/orders/${encodeURIComponent(suppliedOrder)}`
  );

  let { unit, capture } = paypalCaptureFromOrder(order);

  if (
    String(unit?.custom_id || unit?.reference_id || '') !==
    String(purchase.merchant_reference)
  ) {
    throw new Error('PayPal order reference does not match this purchase.');
  }

  if (String(order?.status || '').toUpperCase() !== 'COMPLETED') {
    order = await paypalJson(
      gateway,
      `/v2/checkout/orders/${encodeURIComponent(suppliedOrder)}/capture`,
      {
        method: 'POST',
        headers: {
          'PayPal-Request-Id': `capture-${purchase.merchant_reference}`.slice(
            0,
            120
          ),
        },
        body: '{}',
      }
    );

    ({ unit, capture } = paypalCaptureFromOrder(order));
  }

  const amount = capture?.amount || unit?.amount || {};

  return {
    success:
      String(order?.status || '').toUpperCase() === 'COMPLETED' &&
      String(capture?.status || 'COMPLETED').toUpperCase() === 'COMPLETED',
    amountCents: decimalToCents(amount.value),
    currency: String(amount.currency_code || '').toUpperCase(),
    merchantReference: String(
      unit?.custom_id || unit?.reference_id || ''
    ),
    providerReference: String(capture?.id || order?.id || suppliedOrder),
    providerTransactionId: capture?.id ? String(capture.id) : String(order?.id || ''),
    raw: order,
  };
}

async function initializeReaderSubscriptionPurchase({
  readerUserId,
  planId,
  provider: providerValue,
}) {
  const provider = normalizeProvider(providerValue);

  if (!provider) {
    throw new Error('Select a supported payment gateway.');
  }

  const [reader, plan, gateway] = await Promise.all([
    loadReaderUser(readerUserId),
    loadPlan(planId),
    getGatewayCredentials(provider),
  ]);

  const reference = merchantReference(reader.id);
  const amount = moneyString(plan.price_usd);

  const [result] = await pool.query(
    `
    INSERT INTO reader_subscription_purchases (
      reader_user_id,
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
      reader.id,
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
        reader,
        plan,
      });
    } else if (provider === 'flutterwave') {
      initialized = await initializeFlutterwave({
        gateway,
        purchase,
        reader,
        plan,
      });
    } else {
      initialized = await initializePayPal({
        gateway,
        purchase,
        reader,
        plan,
      });
    }

    await pool.query(
      `
      UPDATE reader_subscription_purchases
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
      UPDATE reader_subscription_purchases
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

async function reconcileReaderSubscriptionPurchase(
  merchantReference,
  {
    providerHint = null,
    flutterwaveTransactionId = null,
    paypalOrderToken = null,
  } = {}
) {
  const reference = String(merchantReference || '').trim();

  if (!reference) {
    throw new Error('Reader subscription purchase reference is required.');
  }

  let purchase = await loadPurchaseByReference(reference);

  if (!purchase) {
    throw new Error('Reader subscription purchase not found.');
  }

  if (String(purchase.status) === 'paid') {
    return sanitizePurchase(purchase);
  }

  if (String(purchase.status) === 'cancelled') {
    return sanitizePurchase(purchase);
  }

  const provider = normalizeProvider(providerHint || purchase.provider);

  if (!provider || provider !== normalizeProvider(purchase.provider)) {
    throw new Error('Payment gateway does not match this purchase.');
  }

  const gateway = await getGatewayCredentials(provider, {
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
      UPDATE reader_subscription_purchases
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
      UPDATE reader_subscription_purchases
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
      UPDATE reader_subscription_purchases
      SET
        status = 'failed',
        gateway_response_json = ?,
        failure_reason = 'Verified payment did not match the expected Reader subscription purchase.',
        updated_at = NOW()
      WHERE id = ?
      `,
      [JSON.stringify(verification.raw || {}), purchase.id]
    );

    return sanitizePurchase(await loadPurchaseByReference(reference));
  }

  const providerReference =
    verification.providerReference || purchase.merchant_reference;

  const subscription = await activateReaderPlatformSubscription({
    readerUserId: Number(purchase.reader_user_id),
    planId: Number(purchase.plan_id),
    amountPaidUsd: moneyString(purchase.expected_amount_usd),
    providerName: gateway.displayName,
    providerReference,
  });

  const subscriptionId =
    positiveInt(subscription?.subscription_id) ||
    positiveInt(subscription?.id) ||
    null;

  await pool.query(
    `
    UPDATE reader_subscription_purchases
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
      subscriptionId,
      purchase.id,
    ]
  );

  purchase = await loadPurchaseByReference(reference);
  return sanitizePurchase(purchase);
}

async function getReaderSubscriptionPurchaseStatus({
  readerUserId,
  merchantReference,
}) {
  const purchase = await loadPurchaseByReference(merchantReference);

  if (
    !purchase ||
    Number(purchase.reader_user_id) !== Number(readerUserId)
  ) {
    throw new Error('Reader subscription purchase not found.');
  }

  return sanitizePurchase(purchase);
}

async function markReaderSubscriptionPurchaseCancelled(merchantReference) {
  const reference = String(merchantReference || '').trim();

  if (!reference) {
    throw new Error('Reader subscription purchase reference is required.');
  }

  await pool.query(
    `
    UPDATE reader_subscription_purchases
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
  getReaderSubscriptionCheckoutOptions,
  initializeReaderSubscriptionPurchase,
  reconcileReaderSubscriptionPurchase,
  getReaderSubscriptionPurchaseStatus,
  markReaderSubscriptionPurchaseCancelled,
  getGatewayCredentials,
  verifyPaystack,
  verifyFlutterwave,
  verifyPayPal,
  fetchJson,
  paypalJson,
  moneyString,
  decimalToCents,
};
