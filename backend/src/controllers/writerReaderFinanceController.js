const pool = require('../config/db');
const {
  money,
  positiveInt,
  ensureReaderWallet,
  ensureWriterWallet,
  getAppreciationSettings,
  creditReaderWallet,
  appreciateWriter,
} = require('../services/writerReaderFinanceService');
const {
  reconcileReaderCreditPurchase,
} = require('../services/readerCreditPaymentService');

function cleanText(value, maxLength = 255) {
  return String(value || '').trim().slice(0, maxLength);
}

async function getReaderCreditWallet(req, res) {
  try {
    const [recoverablePurchases] = await pool.query(
      `
      SELECT merchant_reference
      FROM reader_credit_purchases
      WHERE reader_user_id = ?
        AND status IN ('created', 'initialized', 'pending', 'paid')
        AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY id DESC
      LIMIT 3
      `,
      [req.user.id]
    );

    for (const purchase of recoverablePurchases) {
      const reference = String(purchase?.merchant_reference || '').trim();
      if (!reference) continue;

      try {
        await reconcileReaderCreditPurchase(reference);
      } catch (reconcileError) {
        console.warn(
          'Reader credit wallet reconciliation skipped:',
          reference,
          reconcileError.message
        );
      }
    }

    const wallet = await ensureReaderWallet(req.user.id);
    const settings = await getAppreciationSettings();

    const [transactions] = await pool.query(
      `
      SELECT
        id,
        transaction_type,
        direction,
        credits_amount,
        usd_value,
        credits_balance_before,
        credits_balance_after,
        usd_balance_before,
        usd_balance_after,
        reference_type,
        reference_id,
        reference_code,
        description,
        created_at
      FROM reader_credit_transactions
      WHERE reader_user_id = ?
      ORDER BY id DESC
      LIMIT 100
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      wallet: {
        id: wallet.id,
        available_credits: Number(wallet.available_credits || 0),
        available_value_usd: money(wallet.available_value_usd, 6),
        total_credits_acquired: Number(wallet.total_credits_acquired || 0),
        total_credits_spent: Number(wallet.total_credits_spent || 0),
        total_value_acquired_usd: money(wallet.total_value_acquired_usd, 6),
        total_value_spent_usd: money(wallet.total_value_spent_usd, 6),
        status: wallet.status,
      },
      appreciation_settings: settings,
      transactions,
    });
  } catch (error) {
    console.error('getReaderCreditWallet error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Reader credits.',
      error: error.message,
    });
  }
}

async function createReaderAppreciation(req, res) {
  try {
    const writerUserId = positiveInt(req.body?.writer_user_id || req.body?.writer_id);
    const postId = positiveInt(req.body?.post_id);
    const credits = positiveInt(req.body?.credits);
    const idempotencyKey = cleanText(
      req.get('Idempotency-Key') ||
        req.body?.idempotency_key ||
        req.body?.request_id,
      150
    );

    if (!writerUserId) {
      return res.status(400).json({
        ok: false,
        message: 'Valid Writer ID is required.',
      });
    }

    if (!credits) {
      return res.status(400).json({
        ok: false,
        message: 'Appreciation credits are required.',
      });
    }

    if (!idempotencyKey) {
      return res.status(400).json({
        ok: false,
        message: 'Appreciation idempotency key is required.',
      });
    }

    const result = await appreciateWriter({
      readerUserId: req.user.id,
      writerUserId,
      postId,
      credits,
      idempotencyKey,
    });

    return res.status(result.idempotent_replay ? 200 : 201).json({
      ok: true,
      message: result.idempotent_replay
        ? 'Writer appreciation already processed.'
        : 'Writer appreciated successfully.',
      appreciation: result,
    });
  } catch (error) {
    console.error('createReaderAppreciation error:', error);

    const message = error.message || 'Failed to appreciate Writer.';
    const status =
      /required|minimum|maximum|insufficient|not found|does not belong|disabled|cannot|invalid/i.test(message)
        ? 400
        : 500;

    return res.status(status).json({
      ok: false,
      message,
    });
  }
}

async function getWriterWallet(req, res) {
  try {
    const wallet = await ensureWriterWallet(req.user.id);

    const [[settingsRow]] = await pool.query(
      `
      SELECT withdrawal_threshold
      FROM blogpulse_settings
      ORDER BY id ASC
      LIMIT 1
      `
    );

    const [transactions] = await pool.query(
      `
      SELECT
        id,
        type,
        reference_type,
        reference_id,
        amount,
        status,
        description,
        created_at
      FROM blogpulse_wallet_transactions
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 100
      `,
      [req.user.id]
    );

    const [withdrawals] = await pool.query(
      `
      SELECT
        id,
        amount,
        status,
        payment_method,
        payment_details,
        admin_note,
        reviewed_at,
        created_at,
        updated_at
      FROM blogpulse_withdrawals
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 100
      `,
      [req.user.id]
    );

    const [[appreciationRow]] = await pool.query(
      `
      SELECT
        COUNT(*) AS appreciation_count,
        COALESCE(SUM(credits_amount), 0) AS appreciation_credits,
        COALESCE(SUM(gross_value_usd), 0) AS appreciation_gross_usd,
        COALESCE(SUM(platform_fee_usd), 0) AS appreciation_platform_fee_usd,
        COALESCE(SUM(writer_net_usd), 0) AS appreciation_writer_net_usd
      FROM writer_appreciations
      WHERE writer_user_id = ?
        AND status = 'completed'
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      currency: 'USD',
      wallet: {
        id: wallet.id,
        pending_balance: money(wallet.pending_balance, 2),
        available_balance: money(wallet.available_balance, 2),
        total_earned: money(wallet.total_earned, 2),
        total_withdrawn: money(wallet.total_withdrawn, 2),
        last_credit_at: wallet.last_credit_at,
      },
      withdrawal_threshold: money(settingsRow?.withdrawal_threshold || 0, 2),
      appreciation: {
        count: Number(appreciationRow?.appreciation_count || 0),
        credits: Number(appreciationRow?.appreciation_credits || 0),
        gross_usd: money(appreciationRow?.appreciation_gross_usd, 6),
        platform_fee_usd: money(appreciationRow?.appreciation_platform_fee_usd, 6),
        writer_net_usd: money(appreciationRow?.appreciation_writer_net_usd, 6),
      },
      transactions,
      withdrawals,
    });
  } catch (error) {
    console.error('getWriterWallet error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer wallet.',
      error: error.message,
    });
  }
}

async function requestWriterWithdrawal(req, res) {
  const connection = await pool.getConnection();

  try {
    const amount = money(req.body?.amount, 2);
    const paymentMethod = cleanText(req.body?.payment_method, 50) || null;
    const paymentDetails = cleanText(req.body?.payment_details, 2000) || null;

    if (amount <= 0) {
      connection.release();

      return res.status(400).json({
        ok: false,
        message: 'Withdrawal amount must be greater than zero.',
      });
    }

    await connection.beginTransaction();

    const wallet = await ensureWriterWallet(req.user.id, connection, true);

    const [[settingsRow]] = await connection.query(
      `
      SELECT withdrawal_threshold
      FROM blogpulse_settings
      ORDER BY id ASC
      LIMIT 1
      FOR UPDATE
      `
    );

    const threshold = money(settingsRow?.withdrawal_threshold || 0, 2);
    const available = money(wallet.available_balance, 2);

    if (threshold > 0 && amount < threshold) {
      await connection.rollback();
      connection.release();

      return res.status(400).json({
        ok: false,
        message: `Minimum withdrawal is USD ${threshold.toFixed(2)}.`,
      });
    }

    if (available < amount) {
      await connection.rollback();
      connection.release();

      return res.status(400).json({
        ok: false,
        message: `Insufficient Writer wallet balance. Available: USD ${available.toFixed(2)}.`,
      });
    }

    const nextAvailable = money(available - amount, 2);

    const [withdrawalResult] = await connection.query(
      `
      INSERT INTO blogpulse_withdrawals (
        user_id,
        wallet_id,
        amount,
        status,
        payment_method,
        payment_details,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, 'pending', ?, ?, NOW(), NOW())
      `,
      [req.user.id, wallet.id, amount, paymentMethod, paymentDetails]
    );

    await connection.query(
      `
      UPDATE blogpulse_wallets
      SET
        available_balance = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [nextAvailable, wallet.id]
    );

    await connection.query(
      `
      INSERT INTO blogpulse_wallet_transactions (
        user_id,
        wallet_id,
        type,
        reference_type,
        reference_id,
        amount,
        status,
        description,
        created_at
      )
      VALUES (?, ?, 'withdrawal_request', 'blogpulse_withdrawal', ?, ?, 'pending', 'Writer withdrawal requested.', NOW())
      `,
      [req.user.id, wallet.id, withdrawalResult.insertId, amount]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      ok: true,
      message: 'Withdrawal request submitted.',
      withdrawal_id: withdrawalResult.insertId,
      amount,
      available_balance: nextAvailable,
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    connection.release();

    console.error('requestWriterWithdrawal error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to request withdrawal.',
      error: error.message,
    });
  }
}

async function grantReaderCredits(req, res) {
  try {
    const readerUserId = positiveInt(req.body?.reader_user_id || req.body?.reader_id);
    const credits = positiveInt(req.body?.credits);
    const usdValue = cleanText(req.body?.usd_value, 40);
    const reference = cleanText(
      req.body?.reference || req.body?.reference_code,
      150
    );

    if (!readerUserId || !credits) {
      return res.status(400).json({
        ok: false,
        message: 'Valid Reader ID and credit amount are required.',
      });
    }

    if (!reference) {
      return res.status(400).json({
        ok: false,
        message: 'A unique Reader credit grant reference is required.',
      });
    }

    const [[reader]] = await pool.query(
      `
      SELECT id, role, status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [readerUserId]
    );

    if (!reader || reader.role !== 'customer' || reader.status !== 'active') {
      return res.status(404).json({
        ok: false,
        message: 'Active Reader account not found.',
      });
    }

    const result = await creditReaderWallet({
      readerUserId,
      credits,
      usdValue,
      sourceType: 'admin_grant',
      sourceReference: reference,
      createdByUserId: req.user.id,
    });

    return res.status(result.idempotent_replay ? 200 : 201).json({
      ok: true,
      message: result.idempotent_replay
        ? 'Reader credit grant already processed.'
        : 'Reader credits granted.',
      credit: result,
    });
  } catch (error) {
    console.error('grantReaderCredits error:', error);

    const message = error.message || 'Failed to grant Reader credits.';
    const status = /required|invalid|negative|positive/i.test(message)
      ? 400
      : 500;

    return res.status(status).json({
      ok: false,
      message,
    });
  }
}

async function listWriterWithdrawals(req, res) {
  try {
    const status = cleanText(req.query?.status, 20);

    let sql = `
      SELECT
        bw.id,
        bw.user_id,
        bw.wallet_id,
        bw.amount,
        bw.status,
        bw.payment_method,
        bw.payment_details,
        bw.admin_note,
        bw.reviewed_by,
        bw.reviewed_at,
        bw.created_at,
        bw.updated_at,
        u.name AS writer_name,
        u.email AS writer_email
      FROM blogpulse_withdrawals bw
      INNER JOIN users u
        ON u.id = bw.user_id
      WHERE 1 = 1
    `;

    const params = [];

    if (status && ['pending', 'approved', 'paid', 'rejected'].includes(status)) {
      sql += ' AND bw.status = ? ';
      params.push(status);
    }

    sql += ' ORDER BY bw.id DESC LIMIT 500 ';

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      ok: true,
      withdrawals: rows,
    });
  } catch (error) {
    console.error('listWriterWithdrawals error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to load Writer withdrawals.',
      error: error.message,
    });
  }
}

async function reviewWriterWithdrawal(req, res) {
  const connection = await pool.getConnection();

  try {
    const withdrawalId = positiveInt(req.params?.withdrawalId);
    const action = cleanText(req.params?.action, 20).toLowerCase();
    const adminNote = cleanText(req.body?.admin_note, 2000) || null;

    if (!withdrawalId) {
      connection.release();

      return res.status(400).json({
        ok: false,
        message: 'Valid withdrawal ID is required.',
      });
    }

    if (!['approve', 'paid', 'reject'].includes(action)) {
      connection.release();

      return res.status(400).json({
        ok: false,
        message: 'Withdrawal action must be approve, paid, or reject.',
      });
    }

    await connection.beginTransaction();

    const [[withdrawal]] = await connection.query(
      `
      SELECT *
      FROM blogpulse_withdrawals
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [withdrawalId]
    );

    if (!withdrawal) {
      await connection.rollback();
      connection.release();

      return res.status(404).json({
        ok: false,
        message: 'Writer withdrawal not found.',
      });
    }

    const wallet = await ensureWriterWallet(withdrawal.user_id, connection, true);
    const amount = money(withdrawal.amount, 2);

    const [[transaction]] = await connection.query(
      `
      SELECT *
      FROM blogpulse_wallet_transactions
      WHERE reference_type = 'blogpulse_withdrawal'
        AND reference_id = ?
        AND wallet_id = ?
      ORDER BY id ASC
      LIMIT 1
      FOR UPDATE
      `,
      [withdrawal.id, wallet.id]
    );

    if (action === 'approve') {
      if (withdrawal.status !== 'pending') {
        throw new Error('Only pending withdrawals can be approved.');
      }

      await connection.query(
        `
        UPDATE blogpulse_withdrawals
        SET
          status = 'approved',
          admin_note = ?,
          reviewed_by = ?,
          reviewed_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
        `,
        [adminNote, req.user.id, withdrawal.id]
      );

      if (transaction) {
        await connection.query(
          `
          UPDATE blogpulse_wallet_transactions
          SET status = 'approved'
          WHERE id = ?
          `,
          [transaction.id]
        );
      }
    }

    if (action === 'paid') {
      if (!['pending', 'approved'].includes(withdrawal.status)) {
        throw new Error('Only pending or approved withdrawals can be marked paid.');
      }

      await connection.query(
        `
        UPDATE blogpulse_withdrawals
        SET
          status = 'paid',
          admin_note = ?,
          reviewed_by = ?,
          reviewed_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
        `,
        [adminNote, req.user.id, withdrawal.id]
      );

      await connection.query(
        `
        UPDATE blogpulse_wallets
        SET
          total_withdrawn = total_withdrawn + ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [amount, wallet.id]
      );

      if (transaction) {
        await connection.query(
          `
          UPDATE blogpulse_wallet_transactions
          SET
            type = 'withdrawal_paid',
            status = 'paid',
            description = 'Writer withdrawal paid.'
          WHERE id = ?
          `,
          [transaction.id]
        );
      }
    }

    if (action === 'reject') {
      if (!['pending', 'approved'].includes(withdrawal.status)) {
        throw new Error('Only pending or approved withdrawals can be rejected.');
      }

      const restored = money(Number(wallet.available_balance || 0) + amount, 2);

      await connection.query(
        `
        UPDATE blogpulse_wallets
        SET
          available_balance = ?,
          updated_at = NOW()
        WHERE id = ?
        `,
        [restored, wallet.id]
      );

      await connection.query(
        `
        UPDATE blogpulse_withdrawals
        SET
          status = 'rejected',
          admin_note = ?,
          reviewed_by = ?,
          reviewed_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
        `,
        [adminNote, req.user.id, withdrawal.id]
      );

      if (transaction) {
        await connection.query(
          `
          UPDATE blogpulse_wallet_transactions
          SET
            type = 'withdrawal_rejected',
            status = 'rejected',
            description = 'Writer withdrawal rejected and balance restored.'
          WHERE id = ?
          `,
          [transaction.id]
        );
      }
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      ok: true,
      message:
        action === 'approve'
          ? 'Writer withdrawal approved.'
          : action === 'paid'
          ? 'Writer withdrawal marked paid.'
          : 'Writer withdrawal rejected and balance restored.',
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    connection.release();

    console.error('reviewWriterWithdrawal error:', error);

    const status = /only pending|only pending or approved/i.test(error.message || '')
      ? 400
      : 500;

    return res.status(status).json({
      ok: false,
      message: error.message || 'Failed to review Writer withdrawal.',
    });
  }
}

module.exports = {
  getReaderCreditWallet,
  createReaderAppreciation,
  getWriterWallet,
  requestWriterWithdrawal,
  grantReaderCredits,
  listWriterWithdrawals,
  reviewWriterWithdrawal,
};