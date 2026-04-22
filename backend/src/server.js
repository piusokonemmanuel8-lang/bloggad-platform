require('dotenv').config();

const http = require('http');
const pool = require('./config/db');
const createApp = require('./app');

const app = createApp();

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';

let server;

async function startServer() {
  try {
    await pool.query('SELECT 1');

    server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Bloggad backend running on port ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);

      console.log('Auth base route: /api/auth');

      console.log('Affiliate dashboard base route: /api/affiliate/dashboard');
      console.log('Affiliate website base route: /api/affiliate/website');
      console.log('Affiliate product base route: /api/affiliate/products');
      console.log('Affiliate post base route: /api/affiliate/posts');
      console.log('Affiliate template base route: /api/affiliate/templates');
      console.log('Affiliate subscription base route: /api/affiliate/subscription');
      console.log('Affiliate menu base route: /api/affiliate/menus');
      console.log('Affiliate slider base route: /api/affiliate/sliders');
      console.log('Affiliate design base route: /api/affiliate/design');
      console.log('Affiliate analytics base route: /api/affiliate/analytics');
      console.log('Affiliate media base route: /api/affiliate/media');

      console.log('Admin dashboard base route: /api/admin/dashboard');
      console.log('Admin category base route: /api/admin/categories');
      console.log('Admin template base route: /api/admin/templates');
      console.log('Admin plan base route: /api/admin/plans');
      console.log('Admin affiliate base route: /api/admin/affiliates');
      console.log('Admin product base route: /api/admin/products');
      console.log('Admin post base route: /api/admin/posts');
      console.log('Admin link validation base route: /api/admin/link-validation');

      console.log('Public home base route: /api/public/home');
      console.log('Public website base route: /api/public/websites');
      console.log('Public category base route: /api/public/categories');
      console.log('Public product base route: /api/public/products');
      console.log('Public post base route: /api/public/posts');

      console.log('Customer auth base route: /api/customer-auth');
      console.log('Customer dashboard base route: /api/customer');
      console.log('Customer saved base route: /api/customer/saved');
      console.log('Customer management base route: /api/customer-management');
      console.log('Email list base route: /api/email-list');
      console.log('Customer-affiliate chat base route: /api/customer-affiliate-chats');
      console.log('Customer-admin chat base route: /api/customer-admin-chats');
      console.log('Affiliate-admin chat base route: /api/affiliate-admin-chats');
    });
  } catch (error) {
    console.error('Failed to start Bloggad backend:', error.message);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    await pool.end();
    console.log('Bloggad backend stopped successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();