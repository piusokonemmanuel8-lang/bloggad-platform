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

  let current = __dirname;

  for (let depth = 0; depth < 12; depth += 1) {
    if (path.basename(current) === 'hbuilds') {
      candidates.push(path.join(current, 'config', '.env'));
      break;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return candidates.find((candidate) => fs.existsSync(candidate)) || '';
}

const sharedHostingerEnv = resolveSharedHostingerEnv();

if (sharedHostingerEnv) {
  require('dotenv').config({ path: sharedHostingerEnv });
} else {
  require('dotenv').config();
}

const pool = require('../config/db');
const {
  startWebinarTranscodeJob,
  stopWebinarTranscodeJob,
} = require('../jobs/webinarTranscodeJob');

let shuttingDown = false;

function isEnabled() {
  return String(process.env.WEBINAR_TRANSCODE_ENABLED || '')
    .trim()
    .toLowerCase() === 'true';
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`[webinar-worker] ${signal} received. Shutting down...`);

  try {
    stopWebinarTranscodeJob();
    await pool.end();
    console.log('[webinar-worker] stopped successfully');
    process.exit(0);
  } catch (error) {
    console.error('[webinar-worker] shutdown failed:', error.message);
    process.exit(1);
  }
}

if (!isEnabled()) {
  console.log(
    '[webinar-worker] disabled; set WEBINAR_TRANSCODE_ENABLED=true only on the dedicated transcoding worker'
  );
  process.exit(0);
}

console.log('[webinar-worker] starting dedicated webinar transcoding worker');
startWebinarTranscodeJob();

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
