const fs = require('fs');
const path = require('path');

function resolveSharedHostingerEnv() {
  const candidates = [];

  if (process.env.HOME) {
    candidates.push(
      path.join(
        process.env.HOME,
        'domains',
        'bloggad.com',
        'hbuilds',
        'config',
        '.env'
      )
    );
  }

  candidates.push(
    path.join(__dirname, '..', '..', '.env')
  );

  return candidates.find((candidate) =>
    fs.existsSync(candidate)
  );
}

const envPath = resolveSharedHostingerEnv();

if (envPath) {
  require('dotenv').config({
    path: envPath,
    quiet: true,
  });
}

const pool = require('../config/db');
const {
  processCloudFrontDeliveryBatch,
} = require('../services/webinarCloudFrontDeliveryService');

let shuttingDown = false;
let timer = null;
let running = false;

function isEnabled() {
  return String(
    process.env.WEBINAR_CLOUDFRONT_DELIVERY_ENABLED || ''
  )
    .trim()
    .toLowerCase() === 'true';
}

function intervalMs() {
  const seconds = Number(
    process.env.WEBINAR_CLOUDFRONT_DELIVERY_INTERVAL_SECONDS || 300
  );

  if (!Number.isInteger(seconds) || seconds < 60) {
    return 300000;
  }

  return Math.min(seconds, 3600) * 1000;
}

async function runOnce() {
  if (running || shuttingDown) return;

  running = true;

  try {
    const result = await processCloudFrontDeliveryBatch();

    console.log(
      '[webinar-delivery] batch complete',
      JSON.stringify({
        scanned: result.scanned,
        processed: result.processed,
        skipped: result.skipped,
        failed: result.failed,
      })
    );
  } catch (error) {
    console.error(
      '[webinar-delivery] batch failed:',
      error.message
    );
  } finally {
    running = false;
  }
}

async function shutdown(signal) {
  if (shuttingDown) return;

  shuttingDown = true;

  console.log(`[webinar-delivery] received ${signal}`);

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  try {
    await pool.end();
    console.log('[webinar-delivery] stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error(
      '[webinar-delivery] shutdown failed:',
      error.message
    );
    process.exit(1);
  }
}

if (!isEnabled()) {
  console.log(
    '[webinar-delivery] disabled; set WEBINAR_CLOUDFRONT_DELIVERY_ENABLED=true only on the delivery-accounting worker'
  );
  process.exit(0);
}

console.log(
  '[webinar-delivery] starting CloudFront delivery-accounting worker'
);

runOnce();

timer = setInterval(() => {
  runOnce();
}, intervalMs());

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));