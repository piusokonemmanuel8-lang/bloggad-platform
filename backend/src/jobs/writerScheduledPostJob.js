const {
  publishDueScheduledPosts,
} = require('../controllers/affiliate/affiliatePostController');

let timer = null;
let running = false;

async function runWriterScheduledPostRelease() {
  if (running) return;

  running = true;

  try {
    const summary = await publishDueScheduledPosts(25);

    if (summary.checked > 0) {
      console.log(
        `[writer-schedule] checked=${summary.checked} published=${summary.published} blocked=${summary.blocked} failed=${summary.failed}`
      );
    }
  } catch (error) {
    console.error('[writer-schedule] release job failed:', error.message);
  } finally {
    running = false;
  }
}

function startWriterScheduledPostJob() {
  if (timer) return;

  runWriterScheduledPostRelease();
  timer = setInterval(runWriterScheduledPostRelease, 60 * 1000);
  console.log('[writer-schedule] scheduled post release job runs every 60 seconds');
}

function stopWriterScheduledPostJob() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

module.exports = {
  runWriterScheduledPostRelease,
  startWriterScheduledPostJob,
  stopWriterScheduledPostJob,
};
