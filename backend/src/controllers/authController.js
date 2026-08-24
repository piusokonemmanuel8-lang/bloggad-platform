const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const generateToken = require('../utils/generateToken');

const COOKIE_NAME = 'bloggad_token';

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

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

async function registerAffiliate(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Name is required',
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Email is required',
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        ok: false,
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      `
      INSERT INTO users (name, email, password, role, status, created_at, updated_at)
      VALUES (?, ?, ?, 'affiliate', 'active', NOW(), NOW())
      `,
      [cleanName, cleanEmail, hashedPassword]
    );

    const [users] = await pool.query(
      `
      SELECT id, name, email, role, status, email_verified_at, last_login_at, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    const user = users[0];
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      ok: true,
      message: 'Affiliate registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('registerAffiliate error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to register affiliate',
      error: error.message,
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'Email is required',
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        message: 'Password is required',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    const [users] = await pool.query(
      `
      SELECT id, name, email, password, role, status, email_verified_at, last_login_at, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid email or password',
      });
    }

    const user = users[0];

    if (user.status !== 'active') {
      return res.status(403).json({
        ok: false,
        message: 'This account is not active',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        ok: false,
        message: 'Invalid email or password',
      });
    }

    await pool.query(
      'UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = ?',
      [user.id]
    );

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      ok: true,
      message: 'Login successful',
      token,
      user: sanitizeUser({
        ...user,
        password: undefined,
        last_login_at: new Date(),
      }),
    });
  } catch (error) {
    console.error('loginUser error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
}

async function getMe(req, res) {
  try {
    const [users] = await pool.query(
      `
      SELECT id, name, email, role, status, email_verified_at, last_login_at, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'User not found',
      });
    }

    const databaseUser = users[0];
    const databaseRole = String(databaseUser.role || '').trim().toLowerCase();
    const sessionRole = String(req.user?.role || '').trim().toLowerCase();

    const responseRole =
      ['customer', 'affiliate'].includes(databaseRole) &&
      ['customer', 'affiliate'].includes(sessionRole)
        ? sessionRole
        : databaseRole;

    return res.status(200).json({
      ok: true,
      user: sanitizeUser({
        ...databaseUser,
        role: responseRole,
      }),
    });
  } catch (error) {
    console.error('getMe error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch user profile',
      error: error.message,
    });
  }
}

async function switchRole(req, res) {
  try {
    const requestedRole = String(req.body?.role || '').trim().toLowerCase();

    if (!['reader', 'writer'].includes(requestedRole)) {
      return res.status(400).json({
        ok: false,
        message: 'Role must be reader or writer.',
      });
    }

    const [currentUsers] = await pool.query(
      `
      SELECT id, name, email, role, status, email_verified_at, last_login_at, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    const currentUser = currentUsers[0] || null;

    if (!currentUser) {
      return res.status(404).json({
        ok: false,
        message: 'User not found.',
      });
    }

    if (currentUser.role === 'admin') {
      return res.status(403).json({
        ok: false,
        message: 'Admin accounts cannot switch into Reader or Writer mode.',
      });
    }

    if (!['customer', 'affiliate'].includes(currentUser.role)) {
      return res.status(403).json({
        ok: false,
        message: 'This account cannot switch Reader/Writer role.',
      });
    }

    const nextLegacyRole = requestedRole === 'writer' ? 'affiliate' : 'customer';

    if (currentUser.role !== nextLegacyRole) {
      await pool.query(
        `
        UPDATE users
        SET role = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [nextLegacyRole, currentUser.id]
      );
    }

    const [freshUsers] = await pool.query(
      `
      SELECT id, name, email, role, status, email_verified_at, last_login_at, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [currentUser.id]
    );

    const freshUser = freshUsers[0];

    const token = generateToken({
      id: freshUser.id,
      email: freshUser.email,
      role: freshUser.role,
    });

    setAuthCookie(res, token);

    return res.status(200).json({
      ok: true,
      message: requestedRole === 'writer'
        ? 'Switched to Writer.'
        : 'Switched to Reader.',
      token,
      user: sanitizeUser(freshUser),
      active_role: requestedRole,
      redirect_to: requestedRole === 'writer'
        ? '/writer/dashboard'
        : '/reader/dashboard',
    });
  } catch (error) {
    console.error('switchRole error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to switch role.',
      error: error.message,
    });
  }
}
async function logoutUser(req, res) {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({
      ok: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('logoutUser error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to logout',
      error: error.message,
    });
  }
}

module.exports = {
  registerAffiliate,
  loginUser,
  getMe,
  switchRole,
  logoutUser,
};