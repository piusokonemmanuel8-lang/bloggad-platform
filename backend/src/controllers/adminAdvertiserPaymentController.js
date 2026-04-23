const pool = require('../config/db');

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function cleanLongText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

async function getAdminAdvertiserPayments(req, res) {
  try {
    const status = String(req.query?.status || '').trim();
    const search = String(req.query?.search || '').trim();

    let sql = `
      SELECT
        ap.id,
        ap.advertiser_profile_id,
        ap.advertiser_wallet_id,
        ap.payment_method,
        ap.provider_name,
        ap.provider_reference,
        ap.amount,
        ap.currency_code,
        ap.payment_status,
        ap.proof_url,
        ap.notes,
        ap.paid_at,
        ap.approved_by_user_id,
        ap.created_at,
        ap.updated_at,
        cap.business_name,
        cap.contact_name,
        cap.contact_email,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        aw.available_balance,
        aw.locked_balance,
        aw.total_funded,
        aw.total_spent,
        aw.total_refunded
      FROM advertiser_payments ap
      INNER JOIN customer_advertiser_profiles cap
        ON cap.id = ap.advertiser_profile_id
      INNER JOIN users u
        ON u.id = cap.user_id
      INNER JOIN advertiser_wallets aw
        ON aw.id = ap.advertiser_wallet_id
      WHERE 1 = 1
    `;

    const params = [];

    if (status) {
      sql += ` AND ap.payment_status = ? `;
      params.push(status);
    }

    if (search) {
      sql += `
        AND (
          cap.business_name LIKE ?
          OR cap.contact_name LIKE ?
          OR cap.contact_email LIKE ?
          OR u.name LIKE ?
          OR u.email LIKE ?
          OR ap.provider_name LIKE ?
          OR ap.provider_reference LIKE ?
        )
      `;
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like, like);
    }

    sql += ` ORDER BY ap.id DESC `;

    const [payments] = await pool.query(sql, params);

    return res.status(200).json({
      ok: true,
      payments,
    });
  } catch (error) {
    console.error('getAdminAdvertiserPayments error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser payments.',
      error: error.message,
    });
  }
}

async function getAdminAdvertiserPaymentById(req, res) {
  try {
    const paymentId = toNumber(req.params?.paymentId);

    if (!paymentId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid paymentId is required.',
      });
    }

    const [paymentRows] = await pool.query(
      `
        SELECT
          ap.*,
          cap.business_name,
          cap.contact_name,
          cap.contact_email,
          cap.contact_phone,
          cap.website_url,
          cap.brand_name,
          cap.business_type,
          cap.verification_status,
          u.id AS user_id,
          u.name AS user_name,
          u.email AS user_email,
          aw.available_balance,
          aw.locked_balance,
          aw.total_funded,
          aw.total_spent,
          aw.total_refunded
        FROM advertiser_payments ap
        INNER JOIN customer_advertiser_profiles cap
          ON cap.id = ap.advertiser_profile_id
        INNER JOIN users u
          ON u.id = cap.user_id
        INNER JOIN advertiser_wallets aw
          ON aw.id = ap.advertiser_wallet_id
        WHERE ap.id = ?
        LIMIT 1
      `,
      [paymentId]
    );

    const payment = paymentRows[0] || null;

    if (!payment) {
      return res.status(404).json({
        ok: false,
        message: 'Payment not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      payment,
    });
  } catch (error) {
    console.error('getAdminAdvertiserPaymentById error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch advertiser payment.',
      error: error.message,
    });
  }
}

async function approveAdminAdvertiserPayment(req, res) {
  const connection = await pool.getConnection();

  try {
    const paymentId = toNumber(req.params?.paymentId);
    const adminUserId = toNumber(req.user?.id);
    const note = cleanLongText(req.body?.note);

    if (!paymentId) {
      connection.release();
      return res.status(400).json({
        ok: false,
        message: 'Valid paymentId is required.',
      });
    }

    await connection.beginTransaction();

    const [paymentRows] = await connection.query(
      `
        SELECT *
        FROM advertiser_payments
        WHERE id = ?
        LIMIT 1
      `,
      [paymentId]
    );

    const payment = paymentRows[0] || null;

    if (!payment) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        ok: false,
        message: 'Payment not found.',
      });
    }

    if (payment.payment_status === 'paid') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        ok: false,
        message: 'Payment has already been approved.',
      });
    }

    const [walletRows] = await connection.query(
      `
        SELECT *
        FROM advertiser_wallets
        WHERE id = ?
        LIMIT 1
      `,
      [payment.advertiser_wallet_id]
    );

    const wallet = walletRows[0] || null;

    if (!wallet) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        ok: false,
        message: 'Advertiser wallet not found.',
      });
    }

    const amount = Number(payment.amount || 0);
    const balanceBefore = Number(wallet.available_balance || 0);
    const balanceAfter = balanceBefore + amount;
    const totalFundedAfter = Number(wallet.total_funded || 0) + amount;

    await connection.query(
      `
        UPDATE advertiser_wallets
        SET
          available_balance = ?,
          total_funded = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [balanceAfter, totalFundedAfter, wallet.id]
    );

    await connection.query(
      `
        UPDATE advertiser_payments
        SET
          payment_status = 'paid',
          paid_at = NOW(),
          approved_by_user_id = ?,
          notes = CASE
            WHEN ? IS NULL OR ? = '' THEN notes
            WHEN notes IS NULL OR notes = '' THEN ?
            ELSE CONCAT(notes, '\n', ?)
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [adminUserId || null, note, note, note, note, paymentId]
    );

    await connection.query(
      `
        INSERT INTO advertiser_wallet_transactions
        (
          advertiser_wallet_id,
          advertiser_profile_id,
          payment_id,
          transaction_type,
          direction,
          amount,
          balance_before,
          balance_after,
          reference_code,
          description,
          created_by_user_id
        )
        VALUES (?, ?, ?, 'fund_credit', 'credit', ?, ?, ?, ?, ?, ?)
      `,
      [
        wallet.id,
        payment.advertiser_profile_id,
        payment.id,
        amount,
        balanceBefore,
        balanceAfter,
        payment.provider_reference || `PAY-${payment.id}`,
        `Advertiser wallet funding approved`,
        adminUserId || null,
      ]
    );

    await connection.commit();

    const [updatedRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_payments
        WHERE id = ?
        LIMIT 1
      `,
      [paymentId]
    );

    connection.release();

    return res.status(200).json({
      ok: true,
      message: 'Advertiser payment approved successfully.',
      payment: updatedRows[0] || null,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error('approveAdminAdvertiserPayment rollback error:', rollbackError);
    }
    connection.release();

    console.error('approveAdminAdvertiserPayment error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to approve advertiser payment.',
      error: error.message,
    });
  }
}

async function rejectAdminAdvertiserPayment(req, res) {
  try {
    const paymentId = toNumber(req.params?.paymentId);
    const adminUserId = toNumber(req.user?.id);
    const rejectionReason = cleanLongText(req.body?.rejection_reason);

    if (!paymentId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid paymentId is required.',
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        ok: false,
        message: 'rejection_reason is required.',
      });
    }

    const [paymentRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_payments
        WHERE id = ?
        LIMIT 1
      `,
      [paymentId]
    );

    const payment = paymentRows[0] || null;

    if (!payment) {
      return res.status(404).json({
        ok: false,
        message: 'Payment not found.',
      });
    }

    if (payment.payment_status === 'paid') {
      return res.status(400).json({
        ok: false,
        message: 'Approved payment cannot be rejected.',
      });
    }

    await pool.query(
      `
        UPDATE advertiser_payments
        SET
          payment_status = 'failed',
          approved_by_user_id = ?,
          notes = CASE
            WHEN notes IS NULL OR notes = '' THEN ?
            ELSE CONCAT(notes, '\n', ?)
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        adminUserId || null,
        `Rejected: ${rejectionReason}`,
        `Rejected: ${rejectionReason}`,
        paymentId,
      ]
    );

    const [updatedRows] = await pool.query(
      `
        SELECT *
        FROM advertiser_payments
        WHERE id = ?
        LIMIT 1
      `,
      [paymentId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Advertiser payment rejected successfully.',
      payment: updatedRows[0] || null,
    });
  } catch (error) {
    console.error('rejectAdminAdvertiserPayment error:', error);
    return res.status(500).json({
      ok: false,
      message: 'Failed to reject advertiser payment.',
      error: error.message,
    });
  }
}

module.exports = {
  getAdminAdvertiserPayments,
  getAdminAdvertiserPaymentById,
  approveAdminAdvertiserPayment,
  rejectAdminAdvertiserPayment,
};