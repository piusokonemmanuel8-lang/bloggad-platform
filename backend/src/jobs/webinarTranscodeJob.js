const {
  processNextQueuedMediaJob,
} = require('../services/webinarTranscodeService');

let timer = null;
let running = false;

function isEnabled() {
  const provider = String(
    process.env.WEBINAR_TRANSCODE_PROVIDER || 'local_ffmpeg'
  )
    .trim()
    .toLowerCase();

  return (
    provider !== 'mediaconvert' &&
    String(process.env.WEBINAR_TRANSCODE_ENABLED || '')
      .trim()
      .toLowerCase() === 'true'
  );
}

async function runWebinarTranscodeJob() {
  if (!isEnabled() || running) return;

  running = true;

  try {
    const result = await processNextQueuedMediaJob();

    if (result.processed) {
      console.log(
        `[webinar-transcode] webinar=${result.webinarId} media_job=${result.mediaJobId} status=${result.status}`
      );
    }
  } catch (error) {
    console.error('[webinar-transcode] job failed:', error.message);
  } finally {
    running = false;
  }
}

function startWebinarTranscodeJob() {
  if (timer || !isEnabled()) {
    if (!isEnabled()) {
      console.log(
        '[webinar-transcode] disabled; set WEBINAR_TRANSCODE_ENABLED=true after FFmpeg is installed'
      );
    }
    return;
  }

  const intervalMs = Math.max(
    5000,
    Number(process.env.WEBINAR_TRANSCODE_POLL_MS || 10000)
  );

  runWebinarTranscodeJob();
  timer = setInterval(runWebinarTranscodeJob, intervalMs);
  console.log(
    `[webinar-transcode] media worker runs every ${intervalMs} ms`
  );
}

function stopWebinarTranscodeJob() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  runWebinarTranscodeJob,
  startWebinarTranscodeJob,
  stopWebinarTranscodeJob,
};
