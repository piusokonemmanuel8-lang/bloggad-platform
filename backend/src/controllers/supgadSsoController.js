const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const pool = require('../config/db');
const generateToken = require('../utils/generateToken');
const {
  getSupgadSsoSecret,
} = require('../services/supgadIntegrationSettingsService');

const PROVIDER = 'supgad';
const COOKIE_NAME = 'bloggad_token';
const SSO_TOKEN_TYPE = 'supgad_bloggad_sso';
const SUPGAD_RETURN_ROLES = new Set([
  'vendor',
  'affiliate',
  'affiliate_manager',
  'freelancer',
  'employer',
  'customer',
  'admin',
]);

function cleanText(value, maxLength) {
  return String(value ?? '')
    .trim()
    .slice(0, maxLength);
}

function cleanEmail(value) {
  return cleanText(value, 190).toLowerCase();
}

function cleanSupgadRole(value) {
  const role = cleanText(value, 64)
    .toLowerCase()
    .replace(/-/g, '_');

  return SUPGAD_RETURN_ROLES.has(role) ? role : '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    email_verified_at: user.email_verified_at,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function invalidSso(res, message = 'Invalid Supgad sign-in request.') {
  return res.status(401).json({
    ok: false,
    message,
  });
}

async function verifySupgadSso(req, res) {
  const secret = await getSupgadSsoSecret();

  if (!secret) {
    return res.status(503).json({
      ok: false,
      message: 'Supgad sign-in is not configured.',
    });
  }

  const rawToken = String(req.body?.token || '').trim();

  if (!rawToken || rawToken.length > 8192) {
    return invalidSso(res);
  }

  let claims;

  try {
    claims = jwt.verify(rawToken, secret, {
      algorithms: ['HS256'],
      issuer: 'supgad',
      audience: 'bloggad',
      clockTolerance: 5,
    });
  } catch (error) {
    return invalidSso(res);
  }

  const subject = cleanText(claims?.sub, 191);
  const supgadUserId = cleanText(claims?.supgad_user_id, 191);
  const jti = cleanText(claims?.jti, 191);
  const email = cleanEmail(claims?.email);
  const fullName = cleanText(claims?.full_name, 150);
  const avatar = cleanText(claims?.avatar, 500);
  const supgadActiveRole = cleanSupgadRole(claims?.supgad_active_role);

  if (
    claims?.token_type !== SSO_TOKEN_TYPE ||
    claims?.bloggad_default_role !== 'reader' ||
    !Number.isFinite(Number(claims?.exp)) ||
    !subject ||
    !supgadUserId ||
    subject !== supgadUserId ||
    !jti ||
    !email ||
    !isValidEmail(email)
  ) {
    return invalidSso(res);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `
      DELETE FROM sso_replay_tokens
      WHERE expires_at < NOW()
      LIMIT 500
      `
    );

    try {
      await connection.query(
        `
        INSERT INTO sso_replay_tokens (
          provider,
          jti,
          external_user_id,
          expires_at,
          created_at
        )
        VALUES (?, ?, ?, FROM_UNIXTIME(?), NOW())
        `,
        [PROVIDER, jti, supgadUserId, Number(claims.exp)]
      );
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        await connection.rollback();

        return res.status(409).json({
          ok: false,
          message: 'This Supgad sign-in request has already been used.',
        });
      }

      throw error;
    }

    const [mappedRows] = await connection.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.email_verified_at,
        u.last_login_at,
        u.created_at,
        u.updated_at
      FROM user_external_identities e
      INNER JOIN users u
        ON u.id = e.user_id
      WHERE e.provider = ?
        AND e.external_user_id = ?
      LIMIT 1
      FOR UPDATE
      `,
      [PROVIDER, supgadUserId]
    );

    let user = mappedRows[0] || null;

    if (!user) {
      const [emailRows] = await connection.query(
        `
        SELECT
          id,
          name,
          email,
          role,
          status,
          email_verified_at,
          last_login_at,
          created_at,
          updated_at
        FROM users
        WHERE email = ?
        LIMIT 1
        FOR UPDATE
        `,
        [email]
      );

      user = emailRows[0] || null;

      if (user) {
        await connection.rollback();

        return res.status(409).json({
          ok: false,
          message:
            'A Bloggad account already uses this email. Sign in to Bloggad normally before linking Supgad.',
        });
      } else {
        const generatedPassword = crypto.randomBytes(48).toString('hex');
        const hashedPassword = await bcrypt.hash(generatedPassword, 12);
        const name = fullName || email.split('@')[0] || 'Supgad Reader';

        const [insertResult] = await connection.query(
          `
          INSERT INTO users (
            name,
            email,
            password,
            role,
            status,
            registered_under_affiliate_id,
            registered_under_website_id,
            signup_source,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, 'customer', 'active', NULL, NULL, 'main_marketplace', NOW(), NOW())
          `,
          [name, email, hashedPassword]
        );

        const [newUserRows] = await connection.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status,
            email_verified_at,
            last_login_at,
            created_at,
            updated_at
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [insertResult.insertId]
        );

        user = newUserRows[0] || null;
      }

      await connection.query(
        `
        INSERT INTO user_external_identities (
          user_id,
          provider,
          external_user_id,
          external_email,
          external_full_name,
          external_avatar,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          user.id,
          PROVIDER,
          supgadUserId,
          email,
          fullName || null,
          avatar || null,
        ]
      );
    } else {
      await connection.query(
        `
        UPDATE user_external_identities
        SET
          external_email = ?,
          external_full_name = ?,
          external_avatar = ?,
          updated_at = NOW()
        WHERE provider = ?
          AND external_user_id = ?
        `,
        [
          email,
          fullName || null,
          avatar || null,
          PROVIDER,
          supgadUserId,
        ]
      );
    }

    if (!user || user.status !== 'active') {
      await connection.rollback();

      return res.status(403).json({
        ok: false,
        message: 'This Bloggad account is not active.',
      });
    }

    await connection.query(
      `
      UPDATE users
      SET
        role = 'customer',
        last_login_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [user.id]
    );

    const [freshRows] = await connection.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        status,
        email_verified_at,
        last_login_at,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [user.id]
    );

    const freshUser = freshRows[0];

    await connection.commit();

    const token = generateToken({
      id: freshUser.id,
      email: freshUser.email,
      role: freshUser.role,
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      ok: true,
      token,
      user: sanitizeUser(freshUser),
      active_role: 'reader',
      supgad_active_role: supgadActiveRole || null,
      redirect_to: '/reader/dashboard',
      provisioned_from: 'supgad',
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    return res.status(500).json({
      ok: false,
      message: 'Supgad sign-in could not be completed.',
    });
  } finally {
    connection.release();
  }
}

module.exports = {
  verifySupgadSso,
};