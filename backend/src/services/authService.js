const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const generateToken = require('../utils/generateToken');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../validators/authValidator');

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

async function findUserById(userId) {
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
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

async function registerAffiliateUser(payload = {}) {
  const validation = validateRegisterInput(payload);

  if (!validation.ok) {
    const error = new Error(validation.message);
    error.status = 400;
    throw error;
  }

  const { name, email, password } = validation.data;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    const error = new Error('Email already exists');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const [result] = await pool.query(
    `
    INSERT INTO users
    (
      name,
      email,
      password,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, 'affiliate', 'active', NOW(), NOW())
    `,
    [name, email, hashedPassword]
  );

  const createdUser = await findUserById(result.insertId);
  const token = generateToken({
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
  });

  return {
    user: sanitizeUser(createdUser),
    token,
  };
}

async function loginUserAccount(payload = {}) {
  const validation = validateLoginInput(payload);

  if (!validation.ok) {
    const error = new Error(validation.message);
    error.status = 400;
    throw error;
  }

  const { email, password } = validation.data;
  const user = await findUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  if (user.status !== 'active') {
    const error = new Error('This account is not active');
    error.status = 403;
    throw error;
  }

  const matches = await bcrypt.compare(password, user.password);

  if (!matches) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  await pool.query(
    `
    UPDATE users
    SET
      last_login_at = NOW(),
      updated_at = NOW()
    WHERE id = ?
    `,
    [user.id]
  );

  const updatedUser = await findUserById(user.id);
  const token = generateToken({
    id: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
  });

  return {
    user: sanitizeUser(updatedUser),
    token,
  };
}

module.exports = {
  findUserByEmail,
  findUserById,
  sanitizeUser,
  registerAffiliateUser,
  loginUserAccount,
};