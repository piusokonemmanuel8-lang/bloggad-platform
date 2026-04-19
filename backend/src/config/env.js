function getEnv(name, fallback = '') {
  const value = process.env[name];

  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return value;
}

const env = {
  PORT: Number(getEnv('PORT', 5000)),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  FRONTEND_URL: getEnv('FRONTEND_URL', 'http://localhost:5173'),

  DB_HOST: getEnv('DB_HOST', 'localhost'),
  DB_PORT: Number(getEnv('DB_PORT', 3306)),
  DB_USER: getEnv('DB_USER', 'root'),
  DB_PASSWORD: getEnv('DB_PASSWORD', ''),
  DB_NAME: getEnv('DB_NAME', 'bloggad_db'),

  JWT_SECRET: getEnv('JWT_SECRET', 'change_this_secret'),
};

module.exports = env;