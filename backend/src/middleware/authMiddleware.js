const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const COOKIE_NAME = 'bloggad_token';

async function protect(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies ? req.cookies[COOKIE_NAME] : null;

    if (cookieToken) {
      token = cookieToken;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized, token missing',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await pool.query(
      `
      SELECT id, name, email, role, status, email_verified_at, last_login_at, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [decoded.id]
    );

    if (!users.length) {
      return res.status(401).json({
        ok: false,
        message: 'Not authorized, user not found',
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'Account is not active',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Not authorized, invalid token',
      error: error.message,
    });
  }
}

function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      message: 'Not authorized',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      ok: false,
      message: 'Admin access only',
    });
  }

  next();
}

function affiliateOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      ok: false,
      message: 'Not authorized',
    });
  }

  if (req.user.role !== 'affiliate') {
    return res.status(403).json({
      ok: false,
      message: 'Affiliate access only',
    });
  }

  next();
}

module.exports = {
  protect,
  adminOnly,
  affiliateOnly,
};