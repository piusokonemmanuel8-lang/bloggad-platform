const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'change_this_jwt_secret';
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || '7d';
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
    }
  );
}

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    email_verified_at: user.email_verified_at,
    last_login_at: user.last_login_at,
    registered_under_affiliate_id: user.registered_under_affiliate_id ?? null,
    registered_under_website_id: user.registered_under_website_id ?? null,
    signup_source: user.signup_source ?? 'main_marketplace',
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function normalizeName(name = '') {
  return String(name).trim().replace(/\s+/g, ' ');
}

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function isStrongEnoughPassword(password = '') {
  return typeof password === 'string' && password.length >= 6;
}

async function findWebsiteById(websiteId) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id,
      aw.website_name,
      aw.slug,
      aw.status
    FROM affiliate_websites aw
    WHERE aw.id = ?
    LIMIT 1
    `,
    [websiteId]
  );

  return rows[0] || null;
}

async function findWebsiteBySlug(slug) {
  const [rows] = await pool.query(
    `
    SELECT
      aw.id,
      aw.user_id,
      aw.website_name,
      aw.slug,
      aw.status
    FROM affiliate_websites aw
    WHERE aw.slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return rows[0] || null;
}

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      password,
      role,
      status,
      email_verified_at,
      last_login_at,
      registered_under_affiliate_id,
      registered_under_website_id,
      signup_source,
      reset_token,
      reset_token_expires_at,
      created_at,
      updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      role,
      status,
      email_verified_at,
      last_login_at,
      registered_under_affiliate_id,
      registered_under_website_id,
      signup_source,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
}

async function registerCustomer(req, res) {
  const connection = await pool.getConnection();

  try {
    const rawName = req.body?.name;
    const rawEmail = req.body?.email;
    const rawPassword = req.body?.password;
    const rawConfirmPassword = req.body?.confirm_password;

    const websiteId = req.body?.website_id || null;
    const websiteSlug = req.body?.website_slug || null;

    const name = normalizeName(rawName);
    const email = normalizeEmail(rawEmail);
    const password = String(rawPassword || '');
    const confirmPassword = String(rawConfirmPassword || '');

    if (!name) {
      return res.status(400).json({
        ok: false,
        message: 'Name is required.',
      });
    }

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: 'Email is required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        ok: false,
        message: 'Please enter a valid email address.',
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: 'Password is required.',
      });
    }

    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({
        ok: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Password confirmation does not match.',
      });
    }

    let website = null;

    if (websiteId) {
      website = await findWebsiteById(websiteId);
    } else if (websiteSlug) {
      website = await findWebsiteBySlug(String(websiteSlug).trim());
    }

    let registeredUnderAffiliateId = null;
    let registeredUnderWebsiteId = null;
    let signupSource = 'main_marketplace';

    if (website) {
      if (website.status !== 'active') {
        return res.status(400).json({
          ok: false,
          message: 'This storefront is not active.',
        });
      }

      registeredUnderAffiliateId = website.user_id;
      registeredUnderWebsiteId = website.id;
      signupSource = 'affiliate_storefront';
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await connection.beginTransaction();

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
      VALUES (?, ?, ?, 'customer', 'active', ?, ?, ?, NOW(), NOW())
      `,
      [
        name,
        email,
        hashedPassword,
        registeredUnderAffiliateId,
        registeredUnderWebsiteId,
        signupSource,
      ]
    );

    const newUserId = insertResult.insertId;

    await connection.commit();

    const user = await findUserById(newUserId);
    const token = signToken(user);

    return res.status(201).json({
      ok: true,
      message: 'Customer account created successfully.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {}

    console.error('registerCustomer error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create customer account.',
      error: error.message,
    });
  } finally {
    connection.release();
  }
}

async function loginCustomer(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const websiteId = req.body?.website_id || null;
    const websiteSlug = req.body?.website_slug || null;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: 'Email is required.',
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: 'Password is required.',
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.role !== 'customer') {
      return res.status(403).json({
        ok: false,
        message: 'This login is for customer accounts only.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: `This account is ${user.status}.`,
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid email or password.',
      });
    }

    let loginStorefront = null;

    if (websiteId) {
      loginStorefront = await findWebsiteById(websiteId);
    } else if (websiteSlug) {
      loginStorefront = await findWebsiteBySlug(String(websiteSlug).trim());
    }

    await pool.query(
      `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ?
      `,
      [user.id]
    );

    const freshUser = await findUserById(user.id);
    const token = signToken(freshUser);

    return res.status(200).json({
      ok: true,
      message: 'Customer login successful.',
      token,
      user: sanitizeUser(freshUser),
      login_context: loginStorefront
        ? {
            website_id: loginStorefront.id,
            website_slug: loginStorefront.slug,
            affiliate_id: loginStorefront.user_id,
          }
        : null,
    });
  } catch (error) {
    console.error('loginCustomer error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to login customer.',
      error: error.message,
    });
  }
}

async function getCustomerMe(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        ok: false,
        message: 'Unauthorized.',
      });
    }

    const user = await findUserById(req.user.id);

    if (!user || user.role !== 'customer') {
      return res.status(404).json({
        ok: false,
        message: 'Customer not found.',
      });
    }

    return res.status(200).json({
      ok: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('getCustomerMe error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch customer profile.',
      error: error.message,
    });
  }
}

async function forgotCustomerPassword(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: 'Email is required.',
      });
    }

    const user = await findUserByEmail(email);

    if (!user || user.role !== 'customer') {
      return res.status(200).json({
        ok: true,
        message: 'If the account exists, a reset token has been created.',
      });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await pool.query(
      `
      UPDATE users
      SET
        reset_token = ?,
        reset_token_expires_at = DATE_ADD(NOW(), INTERVAL 30 MINUTE),
        updated_at = NOW()
      WHERE id = ?
      `,
      [hashedToken, user.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'If the account exists, a reset token has been created.',
      reset_token_for_testing: rawToken,
      expires_in_minutes: 30,
    });
  } catch (error) {
    console.error('forgotCustomerPassword error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to process forgot password request.',
      error: error.message,
    });
  }
}

async function resetCustomerPassword(req, res) {
  try {
    const rawToken = String(req.body?.token || '').trim();
    const password = String(req.body?.password || '');
    const confirmPassword = String(req.body?.confirm_password || '');

    if (!rawToken) {
      return res.status(400).json({
        ok: false,
        message: 'Reset token is required.',
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: 'New password is required.',
      });
    }

    if (!isStrongEnoughPassword(password)) {
      return res.status(400).json({
        ok: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Password confirmation does not match.',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const [rows] = await pool.query(
      `
      SELECT
        id,
        role,
        status,
        reset_token,
        reset_token_expires_at
      FROM users
      WHERE reset_token = ?
        AND reset_token_expires_at IS NOT NULL
        AND reset_token_expires_at >= NOW()
      LIMIT 1
      `,
      [hashedToken]
    );

    const user = rows[0] || null;

    if (!user || user.role !== 'customer') {
      return res.status(400).json({
        ok: false,
        message: 'Invalid or expired reset token.',
      });
    }

    const newHashedPassword = await bcrypt.hash(password, 12);

    await pool.query(
      `
      UPDATE users
      SET
        password = ?,
        reset_token = NULL,
        reset_token_expires_at = NULL,
        updated_at = NOW()
      WHERE id = ?
      `,
      [newHashedPassword, user.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Password reset successful.',
    });
  } catch (error) {
    console.error('resetCustomerPassword error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to reset password.',
      error: error.message,
    });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomerMe,
  forgotCustomerPassword,
  resetCustomerPassword,
};