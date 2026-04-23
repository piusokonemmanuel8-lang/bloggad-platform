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

function sanitizeBusinessType(value) {
  const allowed = ['individual', 'company', 'agency', 'brand', 'other'];
  return allowed.includes(value) ? value : 'individual';
}

async function ensureAdvertiserProfileAndWallet(user) {
  const userId = toNumber(user?.id);

  if (!userId) {
    throw new Error('Authenticated user not found.');
  }

  const [profileRows] = await pool.query(
    `
      SELECT *
      FROM customer_advertiser_profiles
      WHERE user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  let profile = profileRows[0] || null;

  if (!profile) {
    await pool.query(
      `
        INSERT INTO customer_advertiser_profiles
        (
          user_id,
          contact_name,
          contact_email,
          business_type,
          verification_status,
          is_active
        )
        VALUES (?, ?, ?, 'individual', 'unverified', 1)
      `,
      [userId, cleanText(user?.name), cleanText(user?.email)]
    );

    const [freshProfileRows] = await pool.query(
      `
        SELECT *
        FROM customer_advertiser_profiles
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId]
    );

    profile = freshProfileRows[0] || null;
  }

  if (!profile) {
    throw new Error('Failed to create advertiser profile.');
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

  let wallet = walletRows[0] || null;

  if (!wallet) {
    await pool.query(
      `
        INSERT INTO advertiser_wallets
        (
          advertiser_profile_id,
          currency_code,
          available_balance,
          locked_balance,
          total_funded,
          total_spent,
          total_refunded,
          status
        )
        VALUES (?, 'USD', 0.00, 0.00, 0.00, 0.00, 0.00, 'active')
      `,
      [profile.id]
    );

    const [freshWalletRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_wallets
        WHERE advertiser_profile_id = ?
        LIMIT 1
      `,
      [profile.id]
    );

    wallet = freshWalletRows[0] || null;
  }

  return { profile, wallet };
}

async function getCustomerAdvertiserProfile(req, res) {
  try {
    const { profile, wallet } = await ensureAdvertiserProfileAndWallet(req.user);

    return res.status(200).json({
      ok: true,
      advertiser_profile: profile,
      advertiser_wallet: wallet,
    });
  } catch (error) {
    console.error('getCustomerAdvertiserProfile error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser profile.',
      error: error.message,
    });
  }
}

async function createOrUpdateCustomerAdvertiserProfile(req, res) {
  try {
    const userId = toNumber(req.user?.id);

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const businessName = cleanText(req.body?.business_name);
    const contactName = cleanText(req.body?.contact_name || req.user?.name);
    const contactEmail = cleanText(req.body?.contact_email || req.user?.email);
    const contactPhone = cleanText(req.body?.contact_phone, 50);
    const country = cleanText(req.body?.country, 100);
    const state = cleanText(req.body?.state, 100);
    const city = cleanText(req.body?.city, 100);
    const addressLine1 = cleanText(req.body?.address_line1);
    const addressLine2 = cleanText(req.body?.address_line2);
    const websiteUrl = cleanText(req.body?.website_url);
    const brandName = cleanText(req.body?.brand_name);
    const businessType = sanitizeBusinessType(req.body?.business_type);
    const notes = cleanLongText(req.body?.notes);

    const [existingRows] = await pool.query(
      `
        SELECT id
        FROM customer_advertiser_profiles
        WHERE user_id = ?
        LIMIT 1
      `,
      [userId]
    );

    if (existingRows.length) {
      await pool.query(
        `
          UPDATE customer_advertiser_profiles
          SET
            business_name = ?,
            contact_name = ?,
            contact_email = ?,
            contact_phone = ?,
            country = ?,
            state = ?,
            city = ?,
            address_line1 = ?,
            address_line2 = ?,
            website_url = ?,
            brand_name = ?,
            business_type = ?,
            notes = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `,
        [
          businessName,
          contactName,
          contactEmail,
          contactPhone,
          country,
          state,
          city,
          addressLine1,
          addressLine2,
          websiteUrl,
          brandName,
          businessType,
          notes,
          userId,
        ]
      );
    } else {
      await pool.query(
        `
          INSERT INTO customer_advertiser_profiles
          (
            user_id,
            business_name,
            contact_name,
            contact_email,
            contact_phone,
            country,
            state,
            city,
            address_line1,
            address_line2,
            website_url,
            brand_name,
            business_type,
            verification_status,
            is_active,
            notes
          )
          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unverified', 1, ?)
        `,
        [
          userId,
          businessName,
          contactName,
          contactEmail,
          contactPhone,
          country,
          state,
          city,
          addressLine1,
          addressLine2,
          websiteUrl,
          brandName,
          businessType,
          notes,
        ]
      );
    }

    const { profile, wallet } = await ensureAdvertiserProfileAndWallet(req.user);

    return res.status(200).json({
      ok: true,
      message: 'Advertiser profile saved successfully.',
      advertiser_profile: profile,
      advertiser_wallet: wallet,
    });
  } catch (error) {
    console.error('createOrUpdateCustomerAdvertiserProfile error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to save advertiser profile.',
      error: error.message,
    });
  }
}

async function getCustomerAdvertiserWallet(req, res) {
  try {
    const { profile, wallet } = await ensureAdvertiserProfileAndWallet(req.user);

    const [recentTransactions] = await pool.query(
      `
        SELECT
          id,
          campaign_id,
          payment_id,
          transaction_type,
          direction,
          amount,
          balance_before,
          balance_after,
          reference_code,
          description,
          created_at
        FROM advertiser_wallet_transactions
        WHERE advertiser_profile_id = ?
        ORDER BY id DESC
        LIMIT 20
      `,
      [profile.id]
    );

    const [recentPayments] = await pool.query(
      `
        SELECT
          id,
          payment_method,
          provider_name,
          provider_reference,
          amount,
          currency_code,
          payment_status,
          proof_url,
          notes,
          paid_at,
          created_at
        FROM advertiser_payments
        WHERE advertiser_profile_id = ?
        ORDER BY id DESC
        LIMIT 20
      `,
      [profile.id]
    );

    return res.status(200).json({
      ok: true,
      advertiser_profile: profile,
      wallet,
      recent_transactions: recentTransactions,
      recent_payments: recentPayments,
    });
  } catch (error) {
    console.error('getCustomerAdvertiserWallet error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser wallet.',
      error: error.message,
    });
  }
}

module.exports = {
  getCustomerAdvertiserProfile,
  createOrUpdateCustomerAdvertiserProfile,
  getCustomerAdvertiserWallet,
};