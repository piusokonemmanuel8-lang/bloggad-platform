const jwt = require('jsonwebtoken');
const pool = require('../config/db');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'change_this_jwt_secret';
}

async function getUserById(userId) {
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
    [userId]
  );

  return rows[0] || null;
}

function extractToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && String(authHeader).startsWith('Bearer ')) {
    return String(authHeader).split(' ')[1];
  }

  if (req.cookies?.bloggad_token) {
    return req.cookies.bloggad_token;
  }

  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
}

async function protect(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized. No token provided.',
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    if (!decoded?.id) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized. Invalid token payload.',
      });
    }

    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized. User not found.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: `Account is ${user.status}.`,
      });
    }

    const databaseRole = String(user.role || '').trim().toLowerCase();
    const tokenRole = String(decoded.role || '').trim().toLowerCase();

    const sessionRole =
      ['customer', 'affiliate'].includes(databaseRole) &&
      ['customer', 'affiliate'].includes(tokenRole)
        ? tokenRole
        : databaseRole;

    req.user = {
      ...user,
      role: sessionRole,
    };

    next();
  } catch (error) {
    console.error('protect middleware error:', error);

    return res.status(401).json({
      ok: false,
      message: 'Not authorized. Token failed.',
      error: error.message,
    });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: 'You do not have permission to access this resource.',
      });
    }

    next();
  };
}

function adminOnly(req, res, next) {
  return authorize('admin')(req, res, next);
}

function affiliateOnly(req, res, next) {
  return authorize('affiliate')(req, res, next);
}

function customerOnly(req, res, next) {
  return authorize('customer')(req, res, next);
}

function readerOrWriter(req, res, next) {
  return authorize('customer', 'affiliate')(req, res, next);
}

module.exports = {
  protect,
  authorize,
  adminOnly,
  affiliateOnly,
  customerOnly,
  readerOrWriter,
};