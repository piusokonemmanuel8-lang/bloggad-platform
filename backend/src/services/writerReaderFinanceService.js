const pool = require('../config/db');

function money(value, precision = 6) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return 0;
  return Number(number.toFixed(precision));
}

function positiveInt(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function decimalToUnits(value, scale) {
  const raw = String(value ?? '0').trim();

  if (!/^[+-]?\d+(?:\.\d+)?$/.test(raw)) {
    throw new Error('Invalid decimal money value.');
  }

  const negative = raw.startsWith('-');
  const unsigned = raw.replace(/^[+-]/, '');
  const [wholePart, fractionPart = ''] = unsigned.split('.');
  const base = 10n ** BigInt(scale);
  const kept = fractionPart.slice(0, scale).padEnd(scale, '0');
  let units =
    BigInt(wholePart || '0') * base +
    BigInt(kept || '0');

  const nextDigit = fractionPart.length > scale
    ? Number(fractionPart[scale])
    : 0;

  if (nextDigit >= 5) {
    units += 1n;
  }

  return negative ? -units : units;
}

function unitsToDecimal(units, scale) {
  const value = BigInt(units);
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const base = 10n ** BigInt(scale);
  const whole = absolute / base;
  const fraction = String(absolute % base).padStart(scale, '0');

  return `${negative ? '-' : ''}${whole}.${fraction}`;
}

function roundDivideNonNegative(numerator, denominator) {
  const n = BigInt(numerator);
  const d = BigInt(denominator);

  if (n < 0n || d <= 0n) {
    throw new Error('Invalid non-negative rounding input.');
  }

  return (n + d / 2n) / d;
}

function microUsd(value) {
  return decimalToUnits(value, 6);
}

function microUsdString(value) {
  return unitsToDecimal(value, 6);
}

function cents(value) {
  return decimalToUnits(value, 2);
}

function centsString(value) {
  return unitsToDecimal(value, 2);
}

function microUsdToRoundedCents(value) {
  const micro = BigInt(value);
  if (micro < 0n) {
    throw new Error('Negative Writer wallet credits are not supported.');
  }
  return roundDivideNonNegative(micro, 10000n);
}

async function ensureReaderWallet(userId, connection = pool, lock = false) {
  await connection.query(
    `
    INSERT IGNORE INTO reader_credit_wallets (
      reader_user_id,
      available_credits,
      available_value_usd,
      total_credits_acquired,
      total_credits_spent,
      total_value_acquired_usd,
      total_value_spent_usd,
      status,
      created_at,
      updated_at
    )
    VALUES (?, 0, 0.000000, 0, 0, 0.000000, 0.000000, 'active', NOW(), NOW())
    `,
    [userId]
  );

  const [rows] = await connection.query(
    `
    SELECT *
    FROM reader_credit_wallets
    WHERE reader_user_id = ?
    LIMIT 1
    ${lock ? 'FOR UPDATE' : ''}
    `,
    [userId]
  );

  return rows[0] || null;
}

async function ensureWriterWallet(userId, connection = pool, lock = false) {
  await connection.query(
    `
    INSERT IGNORE INTO blogpulse_wallets (
      user_id,
      pending_balance,
      available_balance,
      total_earned,
      total_withdrawn,
      created_at,
      updated_at
    )
    VALUES (?, 0.00, 0.00, 0.00, 0.00, NOW(), NOW())
    `,
    [userId]
  );

  const [rows] = await connection.query(
    `
    SELECT *
    FROM blogpulse_wallets
    WHERE user_id = ?
    LIMIT 1
    ${lock ? 'FOR UPDATE' : ''}
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getAppreciationSettings(connection = pool) {
  const [rows] = await connection.query(
    `
    SELECT
      enabled,
      platform_fee_percent,
      minimum_credits,
      maximum_credits
    FROM writer_appreciation_settings
    ORDER BY id ASC
    LIMIT 1
    `
  );

  if (!rows[0]) {
    return {
      enabled: 1,
      platform_fee_percent: '0.00',
      minimum_credits: 1,
      maximum_credits: null,
    };
  }

  return {
    enabled: Number(rows[0].enabled || 0),
    platform_fee_percent: unitsToDecimal(
      decimalToUnits(rows[0].platform_fee_percent, 2),
      2
    ),
    minimum_credits: Number(rows[0].minimum_credits || 1),
    maximum_credits:
      rows[0].maximum_credits === null || rows[0].maximum_credits === undefined
        ? null
        : Number(rows[0].maximum_credits),
  };
}

async function getExistingCreditGrant(
  connection,
  readerUserId,
  sourceType,
  sourceReference
) {
  if (!sourceReference) return null;

  const [rows] = await connection.query(
    `
    SELECT
      l.id AS lot_id,
      l.wallet_id,
      l.original_credits,
      l.original_value_usd,
      t.id AS transaction_id
    FROM reader_credit_lots l
    LEFT JOIN reader_credit_transactions t
      ON t.reference_type = l.source_type
     AND t.reference_id = l.id
     AND t.direction = 'credit'
    WHERE l.reader_user_id = ?
      AND l.source_type = ?
      AND l.source_reference = ?
    ORDER BY t.id ASC
    LIMIT 1
    `,
    [readerUserId, sourceType, sourceReference]
  );

  return rows[0] || null;
}

async function creditReaderWallet({
  readerUserId,
  credits,
  usdValue,
  sourceType,
  sourceReference = null,
  createdByUserId = null,
}) {
  const creditCount = positiveInt(credits);
  const normalizedSourceType = String(sourceType || 'admin_grant').slice(0, 60);
  const normalizedReference =
    sourceReference === null || sourceReference === undefined
      ? null
      : String(sourceReference).trim().slice(0, 150);

  if (!creditCount) {
    throw new Error('Credits must be a positive whole number.');
  }

  if (normalizedSourceType === 'admin_grant' && !normalizedReference) {
    throw new Error('A unique admin grant reference is required.');
  }

  const valueMicro = microUsd(usdValue);

  if (valueMicro < 0n) {
    throw new Error('USD value cannot be negative.');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const wallet = await ensureReaderWallet(readerUserId, connection, true);

    if (!wallet || wallet.status !== 'active') {
      throw new Error('Reader credit wallet is not active.');
    }

    if (normalizedReference) {
      const existing = await getExistingCreditGrant(
        connection,
        readerUserId,
        normalizedSourceType,
        normalizedReference
      );

      if (existing) {
        await connection.commit();

        return {
          idempotent_replay: true,
          wallet_id: existing.wallet_id,
          lot_id: existing.lot_id,
          transaction_id: existing.transaction_id,
          credits_added: Number(existing.original_credits || 0),
          usd_value_added: microUsdString(microUsd(existing.original_value_usd)),
          available_credits: Number(wallet.available_credits || 0),
          available_value_usd: microUsdString(microUsd(wallet.available_value_usd)),
        };
      }
    }

    const balanceBeforeCredits = Number(wallet.available_credits || 0);
    const balanceAfterCredits = balanceBeforeCredits + creditCount;
    const valueBeforeMicro = microUsd(wallet.available_value_usd);
    const valueAfterMicro = valueBeforeMicro + valueMicro;
    const valueString = microUsdString(valueMicro);
    const valueBeforeString = microUsdString(valueBeforeMicro);
    const valueAfterString = microUsdString(valueAfterMicro);

    const [lotResult] = await connection.query(
      `
      INSERT INTO reader_credit_lots (
        reader_user_id,
        wallet_id,
        source_type,
        source_reference,
        original_credits,
        remaining_credits,
        original_value_usd,
        remaining_value_usd,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available', NOW(), NOW())
      `,
      [
        readerUserId,
        wallet.id,
        normalizedSourceType,
        normalizedReference,
        creditCount,
        creditCount,
        valueString,
        valueString,
      ]
    );

    await connection.query(
      `
      UPDATE reader_credit_wallets
      SET
        available_credits = ?,
        available_value_usd = ?,
        total_credits_acquired = total_credits_acquired + ?,
        total_value_acquired_usd = total_value_acquired_usd + ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        balanceAfterCredits,
        valueAfterString,
        creditCount,
        valueString,
        wallet.id,
      ]
    );

    const [txResult] = await connection.query(
      `
      INSERT INTO reader_credit_transactions (
        reader_user_id,
        wallet_id,
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
        created_by_user_id,
        created_at
      )
      VALUES (?, ?, 'credit', 'credit', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        readerUserId,
        wallet.id,
        creditCount,
        valueString,
        balanceBeforeCredits,
        balanceAfterCredits,
        valueBeforeString,
        valueAfterString,
        normalizedSourceType,
        lotResult.insertId,
        normalizedReference,
        `Reader credits added from ${normalizedSourceType}.`,
        createdByUserId || null,
      ]
    );

    await connection.commit();

    return {
      idempotent_replay: false,
      wallet_id: wallet.id,
      lot_id: lotResult.insertId,
      transaction_id: txResult.insertId,
      credits_added: creditCount,
      usd_value_added: valueString,
      available_credits: balanceAfterCredits,
      available_value_usd: valueAfterString,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function consumeCreditLots(
  connection,
  readerUserId,
  walletId,
  creditsNeeded
) {
  let remainingCredits = creditsNeeded;
  let grossMicro = 0n;

  const [lots] = await connection.query(
    `
    SELECT *
    FROM reader_credit_lots
    WHERE reader_user_id = ?
      AND wallet_id = ?
      AND status = 'available'
      AND remaining_credits > 0
    ORDER BY id ASC
    FOR UPDATE
    `,
    [readerUserId, walletId]
  );

  for (const lot of lots) {
    if (remainingCredits <= 0) break;

    const lotCredits = Number(lot.remaining_credits || 0);
    const lotMicro = microUsd(lot.remaining_value_usd);

    if (!Number.isSafeInteger(lotCredits) || lotCredits <= 0) continue;

    const creditsTaken = Math.min(remainingCredits, lotCredits);
    const usdTakenMicro =
      creditsTaken === lotCredits
        ? lotMicro
        : roundDivideNonNegative(
            lotMicro * BigInt(creditsTaken),
            BigInt(lotCredits)
          );

    const nextCredits = lotCredits - creditsTaken;
    const nextMicro = lotMicro - usdTakenMicro;
    const nextStatus = nextCredits === 0 ? 'consumed' : 'available';

    await connection.query(
      `
      UPDATE reader_credit_lots
      SET
        remaining_credits = ?,
        remaining_value_usd = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [nextCredits, microUsdString(nextMicro), nextStatus, lot.id]
    );

    grossMicro += usdTakenMicro;
    remainingCredits -= creditsTaken;
  }

  if (remainingCredits > 0) {
    throw new Error('Reader credit lots do not cover the requested appreciation.');
  }

  return grossMicro;
}

async function readExistingAppreciation(
  connection,
  readerUserId,
  idempotencyKey
) {
  const [rows] = await connection.query(
    `
    SELECT
      wa.id,
      wa.reader_user_id,
      wa.writer_user_id,
      wa.post_id,
      wa.idempotency_key,
      wa.credits_amount,
      wa.gross_value_usd,
      wa.platform_fee_percent,
      wa.platform_fee_usd,
      wa.writer_net_usd,
      wa.status,
      bw.available_balance AS writer_available_balance,
      rw.available_credits AS reader_available_credits,
      rw.available_value_usd AS reader_available_value_usd
    FROM writer_appreciations wa
    LEFT JOIN blogpulse_wallets bw
      ON bw.user_id = wa.writer_user_id
    LEFT JOIN reader_credit_wallets rw
      ON rw.reader_user_id = wa.reader_user_id
    WHERE wa.reader_user_id = ?
      AND wa.idempotency_key = ?
    LIMIT 1
    `,
    [readerUserId, idempotencyKey]
  );

  return rows[0] || null;
}

async function appreciateWriter({
  readerUserId,
  writerUserId,
  postId = null,
  credits,
  idempotencyKey,
}) {
  const creditCount = positiveInt(credits);
  const normalizedKey = String(idempotencyKey || '').trim().slice(0, 150);

  if (!creditCount) {
    throw new Error('Appreciation credits must be a positive whole number.');
  }

  if (!normalizedKey) {
    throw new Error('Appreciation idempotency key is required.');
  }

  if (Number(readerUserId) === Number(writerUserId)) {
    throw new Error('A Writer cannot appreciate their own account.');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[reader]] = await connection.query(
      `
      SELECT id, role, status
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [readerUserId]
    );

    if (!reader || reader.role !== 'customer' || reader.status !== 'active') {
      throw new Error('Active Reader account required.');
    }

    const existing = await readExistingAppreciation(
      connection,
      readerUserId,
      normalizedKey
    );

    if (existing) {
      await connection.commit();

      return {
        idempotent_replay: true,
        appreciation_id: existing.id,
        credits_spent: Number(existing.credits_amount || 0),
        gross_value_usd: microUsdString(microUsd(existing.gross_value_usd)),
        platform_fee_percent: unitsToDecimal(
          decimalToUnits(existing.platform_fee_percent, 2),
          2
        ),
        platform_fee_usd: microUsdString(microUsd(existing.platform_fee_usd)),
        writer_net_usd: microUsdString(microUsd(existing.writer_net_usd)),
        reader_available_credits: Number(existing.reader_available_credits || 0),
        reader_available_value_usd: microUsdString(
          microUsd(existing.reader_available_value_usd || 0)
        ),
        writer_available_balance: centsString(
          cents(existing.writer_available_balance || 0)
        ),
      };
    }

    const [[writer]] = await connection.query(
      `
      SELECT id, role, status, name
      FROM users
      WHERE id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [writerUserId]
    );

    if (!writer || writer.role !== 'affiliate' || writer.status !== 'active') {
      throw new Error('Active Writer account required.');
    }

    let post = null;

    if (postId) {
      const [[postRow]] = await connection.query(
        `
        SELECT id, user_id, title, status
        FROM product_posts
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
        `,
        [postId]
      );

      if (!postRow || postRow.status !== 'published') {
        throw new Error('Published post not found.');
      }

      if (Number(postRow.user_id) !== Number(writerUserId)) {
        throw new Error('The selected post does not belong to this Writer.');
      }

      post = postRow;
    }

    const settings = await getAppreciationSettings(connection);

    if (!settings.enabled) {
      throw new Error('Writer appreciation is currently disabled.');
    }

    if (creditCount < settings.minimum_credits) {
      throw new Error(`Minimum appreciation is ${settings.minimum_credits} credits.`);
    }

    if (settings.maximum_credits && creditCount > settings.maximum_credits) {
      throw new Error(`Maximum appreciation is ${settings.maximum_credits} credits.`);
    }

    const readerWallet = await ensureReaderWallet(
      readerUserId,
      connection,
      true
    );

    if (!readerWallet || readerWallet.status !== 'active') {
      throw new Error('Reader credit wallet is not active.');
    }

    const creditsBefore = Number(readerWallet.available_credits || 0);
    const valueBeforeMicro = microUsd(readerWallet.available_value_usd);

    if (creditsBefore < creditCount) {
      throw new Error('Insufficient Reader credits.');
    }

    const grossMicro = await consumeCreditLots(
      connection,
      readerUserId,
      readerWallet.id,
      creditCount
    );

    const feeHundredthsPercent = decimalToUnits(
      settings.platform_fee_percent,
      2
    );

    if (feeHundredthsPercent < 0n || feeHundredthsPercent > 10000n) {
      throw new Error('Invalid appreciation platform fee percent.');
    }

    const platformFeeMicro = roundDivideNonNegative(
      grossMicro * feeHundredthsPercent,
      10000n
    );

    const writerNetMicro = grossMicro - platformFeeMicro;
    const writerWalletCreditCents = microUsdToRoundedCents(writerNetMicro);

    const creditsAfter = creditsBefore - creditCount;
    const valueAfterMicro = valueBeforeMicro - grossMicro;

    if (valueAfterMicro < 0n) {
      throw new Error('Reader credit value would become negative.');
    }

    const grossString = microUsdString(grossMicro);
    const feeString = microUsdString(platformFeeMicro);
    const writerNetString = microUsdString(writerNetMicro);
    const feePercentString = unitsToDecimal(feeHundredthsPercent, 2);
    const valueBeforeString = microUsdString(valueBeforeMicro);
    const valueAfterString = microUsdString(valueAfterMicro);
    const writerWalletCreditString = centsString(writerWalletCreditCents);

    const [appreciationResult] = await connection.query(
      `
      INSERT INTO writer_appreciations (
        reader_user_id,
        writer_user_id,
        post_id,
        idempotency_key,
        credits_amount,
        gross_value_usd,
        platform_fee_percent,
        platform_fee_usd,
        writer_net_usd,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())
      `,
      [
        readerUserId,
        writerUserId,
        post ? post.id : null,
        normalizedKey,
        creditCount,
        grossString,
        feePercentString,
        feeString,
        writerNetString,
      ]
    );

    await connection.query(
      `
      UPDATE reader_credit_wallets
      SET
        available_credits = ?,
        available_value_usd = ?,
        total_credits_spent = total_credits_spent + ?,
        total_value_spent_usd = total_value_spent_usd + ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        creditsAfter,
        valueAfterString,
        creditCount,
        grossString,
        readerWallet.id,
      ]
    );

    await connection.query(
      `
      INSERT INTO reader_credit_transactions (
        reader_user_id,
        wallet_id,
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
      )
      VALUES (?, ?, 'appreciation', 'debit', ?, ?, ?, ?, ?, ?, 'writer_appreciation', ?, ?, ?, NOW())
      `,
      [
        readerUserId,
        readerWallet.id,
        creditCount,
        grossString,
        creditsBefore,
        creditsAfter,
        valueBeforeString,
        valueAfterString,
        appreciationResult.insertId,
        normalizedKey,
        post
          ? `Appreciated the Writer on "${post.title}".`
          : 'Appreciated the Writer.',
      ]
    );

    const writerWallet = await ensureWriterWallet(
      writerUserId,
      connection,
      true
    );

    if (!writerWallet) {
      throw new Error('Unable to load Writer wallet.');
    }

    const writerAvailableBeforeCents = cents(writerWallet.available_balance);
    const writerTotalEarnedBeforeCents = cents(writerWallet.total_earned);
    const writerAvailableAfterCents =
      writerAvailableBeforeCents + writerWalletCreditCents;
    const writerTotalEarnedAfterCents =
      writerTotalEarnedBeforeCents + writerWalletCreditCents;

    const writerAvailableAfterString = centsString(
      writerAvailableAfterCents
    );

    await connection.query(
      `
      UPDATE blogpulse_wallets
      SET
        available_balance = ?,
        total_earned = ?,
        last_credit_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        writerAvailableAfterString,
        centsString(writerTotalEarnedAfterCents),
        writerWallet.id,
      ]
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
      VALUES (?, ?, 'credit', 'writer_appreciation', ?, ?, 'approved', ?, NOW())
      `,
      [
        writerUserId,
        writerWallet.id,
        appreciationResult.insertId,
        writerWalletCreditString,
        post
          ? `Reader appreciation received for "${post.title}".`
          : 'Reader appreciation received.',
      ]
    );

    await connection.query(
      `
      INSERT INTO user_notifications (
        recipient_user_id,
        actor_user_id,
        notification_type,
        post_id,
        title,
        message,
        is_read,
        created_at
      )
      VALUES (?, ?, 'reader_appreciated_writer', ?, 'A Reader appreciated your work', ?, 0, NOW())
      `,
      [
        writerUserId,
        readerUserId,
        post ? post.id : null,
        post
          ? `A Reader appreciated your post "${post.title}".`
          : 'A Reader appreciated your work.',
      ]
    );

    await connection.commit();

    return {
      idempotent_replay: false,
      appreciation_id: appreciationResult.insertId,
      credits_spent: creditCount,
      gross_value_usd: grossString,
      platform_fee_percent: feePercentString,
      platform_fee_usd: feeString,
      writer_net_usd: writerNetString,
      writer_wallet_credit_usd: writerWalletCreditString,
      reader_available_credits: creditsAfter,
      reader_available_value_usd: valueAfterString,
      writer_available_balance: writerAvailableAfterString,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  money,
  positiveInt,
  decimalToUnits,
  unitsToDecimal,
  ensureReaderWallet,
  ensureWriterWallet,
  getAppreciationSettings,
  creditReaderWallet,
  appreciateWriter,
};