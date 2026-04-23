const pool = require('../config/db');

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function cleanText(value, max = 255) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
}

function cleanLongText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

async function getAdvertiserProfileAndWalletByUserId(userId) {
  const [profileRows] = await pool.query(
    `
      SELECT *
      FROM customer_advertiser_profiles
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  const profile = profileRows[0] || null;

  if (!profile) {
    throw new Error('Advertiser profile not found.');
  }

  const [walletRows] = await pool.query(
    `
      SELECT *
      FROM advertiser_wallets
      WHERE advertiser_profile_id = ?
      LIMIT 1
    `,
    [profile.id]
  );

  const wallet = walletRows[0] || null;

  if (!wallet) {
    throw new Error('Advertiser wallet not found.');
  }

  return { profile, wallet };
}

async function getCustomerAdvertiserPayments(req, res) {
  try {
    const userId = toNumber(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const { profile, wallet } = await getAdvertiserProfileAndWalletByUserId(userId);

    const [payments] = await pool.query(
      `
        SELECT
          id,
          advertiser_profile_id,
          advertiser_wallet_id,
          payment_method,
          provider_name,
          provider_reference,
          amount,
          currency_code,
          payment_status,
          proof_url,
          notes,
          paid_at,
          approved_by_user_id,
          created_at,
          updated_at
        FROM advertiser_payments
        WHERE advertiser_profile_id = ?
        ORDER BY id DESC
      `,
      [profile.id]
    );

    return res.status(200).json({
      ok: true,
      advertiser_profile: profile,
      wallet,
      payments,
    });
  } catch (error) {
    console.error('getCustomerAdvertiserPayments error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser payments.',
      error: error.message,
    });
  }
}

async function createCustomerAdvertiserPayment(req, res) {
  try {
    const userId = toNumber(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const { profile, wallet } = await getAdvertiserProfileAndWalletByUserId(userId);

    const paymentMethod = cleanText(req.body?.payment_method, 100) || 'manual';
    const providerName = cleanText(req.body?.provider_name, 100);
    const providerReference = cleanText(req.body?.provider_reference, 150);
    const proofUrl = cleanText(req.body?.proof_url);
    const notes = cleanLongText(req.body?.notes);
    const amount = Number(req.body?.amount || 0);
    const currencyCode = cleanText(req.body?.currency_code, 10) || wallet.currency_code || 'USD';

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'A valid amount is required.',
      });
    }

    const [result] = await pool.query(
      `
        INSERT INTO advertiser_payments
        (
          advertiser_profile_id,
          advertiser_wallet_id,
          payment_method,
          provider_name,
          provider_reference,
          amount,
          currency_code,
          payment_status,
          proof_url,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
      `,
      [
        profile.id,
        wallet.id,
        paymentMethod,
        providerName,
        providerReference,
        amount,
        currencyCode,
        proofUrl,
        notes,
      ]
    );

    const [paymentRows] = await pool.query(
      `
        SELECT
          id,
          advertiser_profile_id,
          advertiser_wallet_id,
          payment_method,
          provider_name,
          provider_reference,
          amount,
          currency_code,
          payment_status,
          proof_url,
          notes,
          paid_at,
          approved_by_user_id,
          created_at,
          updated_at
        FROM advertiser_payments
        WHERE id = ?
        LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      message: 'Advertiser funding request created successfully.',
      payment: paymentRows[0] || null,
    });
  } catch (error) {
    console.error('createCustomerAdvertiserPayment error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to create advertiser funding request.',
      error: error.message,
    });
  }
}

module.exports = {
  getCustomerAdvertiserPayments,
  createCustomerAdvertiserPayment,
};