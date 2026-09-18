const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const pool = require('../config/db');
const { getS3Client } = require('../config/s3Storage');
const { getWebinarBucketName } = require('../config/webinarStorage');
const {
  getCurrentWebinarSubscription,
} = require('./webinarSubscriptionService');
const { recordWebinarUsage } = require('./webinarUsageService');

const RENDITIONS = [
  { name: '360p', height: 360, videoBitrate: '800k', audioBitrate: '96k', bandwidth: 1000000 },
  { name: '720p', height: 720, videoBitrate: '2500k', audioBitrate: '128k', bandwidth: 3000000 },
  { name: '1080p', height: 1080, videoBitrate: '5000k', audioBitrate: '160k', bandwidth: 5800000 },
];

function getFfmpegPath() {
  return String(process.env.FFMPEG_PATH || 'ffmpeg').trim();
}

function getFfprobePath() {
  return String(process.env.FFPROBE_PATH || 'ffprobe').trim();
}

function runProcess(command, args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });

    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 24000) {
        stderr = stderr.slice(-24000);
      }
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stderr);
        return;
      }

      reject(
        new Error(
          `${label} failed with exit code ${code}: ${stderr.slice(-4000)}`
        )
      );
    });
  });
}

async function probeVideo(inputPath) {
  const args = [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height:format=duration',
    '-of',
    'json',
    inputPath,
  ];

  const output = await new Promise((resolve, reject) => {
    const child = spawn(getFfprobePath(), args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `ffprobe failed with exit code ${code}: ${stderr.slice(-4000)}`
          )
        );
        return;
      }

      resolve(stdout);
    });
  });

  const parsed = JSON.parse(output || '{}');
  const stream = Array.isArray(parsed.streams) ? parsed.streams[0] : null;

  if (!stream || !Number(stream.height)) {
    throw new Error('Unable to determine source video dimensions');
  }

  return {
    width: Number(stream.width || 0),
    height: Number(stream.height || 0),
    duration: Math.max(0, Math.round(Number(parsed.format?.duration || 0))),
  };
}

async function updateMediaProgress(mediaJobId, processingStage, progressPercent) {
  await pool.query(
    `UPDATE webinar_media_jobs SET processing_stage = ?, progress_percent = ?, stage_updated_at = NOW(), updated_at = NOW() WHERE id = ?`,
    [processingStage, Math.max(0, Math.min(100, Number(progressPercent || 0))), mediaJobId]
  );
}

async function downloadSource(bucket, key, targetPath, onProgress) {
  const controller = new AbortController();
  const stallMs = Math.max(30000, Number(process.env.WEBINAR_SOURCE_DOWNLOAD_STALL_MS || 120000));
  let stallTimer = null;
  const resetStallTimer = () => {
    if (stallTimer) clearTimeout(stallTimer);
    stallTimer = setTimeout(() => controller.abort(), stallMs);
  };
  try {
    resetStallTimer();
    const object = await getS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }), { abortSignal: controller.signal });
    if (!object.Body) throw new Error('Webinar source object has no body');
    const total = Number(object.ContentLength || 0);
    let loaded = 0;
    object.Body.on('data', (chunk) => {
      loaded += Number(chunk?.length || 0);
      resetStallTimer();
      if (onProgress) onProgress(loaded, total);
    });
    await pipeline(object.Body, fs.createWriteStream(targetPath));
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Webinar source download stalled before FFmpeg could start');
    throw error;
  } finally {
    if (stallTimer) clearTimeout(stallTimer);
  }
}

function chooseRenditions(sourceHeight) {
  const selected = RENDITIONS.filter(
    (profile) => profile.height <= sourceHeight
  );

  if (selected.length > 0) return selected;

  return [
    {
      name: `${sourceHeight}p`,
      height: sourceHeight,
      videoBitrate: '650k',
      audioBitrate: '96k',
      bandwidth: 850000,
    },
  ];
}

async function transcodeRendition(inputPath, outputRoot, profile) {
  const renditionDir = path.join(outputRoot, profile.name);
  await fsp.mkdir(renditionDir, { recursive: true });

  const playlistPath = path.join(renditionDir, 'index.m3u8');
  const segmentPattern = path.join(renditionDir, 'segment_%05d.ts');

  const args = [
    '-y',
    '-i',
    inputPath,
    '-map',
    '0:v:0',
    '-map',
    '0:a?',
    '-vf',
    `scale=-2:min(${profile.height}\\,ih)`,
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-profile:v',
    'main',
    '-pix_fmt',
    'yuv420p',
    '-b:v',
    profile.videoBitrate,
    '-maxrate',
    profile.videoBitrate,
    '-bufsize',
    String(Number.parseInt(profile.videoBitrate, 10) * 2) + 'k',
    '-c:a',
    'aac',
    '-b:a',
    profile.audioBitrate,
    '-ar',
    '48000',
    '-ac',
    '2',
    '-force_key_frames',
    'expr:gte(t,n_forced*6)',
    '-hls_time',
    '6',
    '-hls_playlist_type',
    'vod',
    '-hls_flags',
    'independent_segments',
    '-hls_segment_filename',
    segmentPattern,
    playlistPath,
  ];

  await runProcess(getFfmpegPath(), args, `ffmpeg ${profile.name}`);

  return {
    ...profile,
    renditionDir,
  };
}

function createMasterPlaylist(renditions) {
  const lines = ['#EXTM3U', '#EXT-X-VERSION:3'];

  renditions.forEach((profile) => {
    lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${profile.bandwidth}`);
    lines.push(`${profile.name}/index.m3u8`);
  });

  return `${lines.join('\n')}\n`;
}

function contentTypeForFile(filename) {
  if (filename.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (filename.endsWith('.ts')) return 'video/mp2t';
  return 'application/octet-stream';
}

async function listFilesRecursive(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(absolute)));
    } else if (entry.isFile()) {
      files.push(absolute);
    }
  }

  return files;
}

async function directorySizeBytes(dir) {
  const files = await listFilesRecursive(dir);
  let total = 0;

  for (const file of files) {
    const stats = await fsp.stat(file);
    total += Number(stats.size || 0);
  }

  return total;
}

async function getWriterUserIdForWebinar(webinarId) {
  const [[row]] = await pool.query(
    `
    SELECT user_id
    FROM webinars
    WHERE id = ?
    LIMIT 1
    `,
    [webinarId]
  );

  const writerUserId = Number(row?.user_id || 0);

  if (!Number.isSafeInteger(writerUserId) || writerUserId <= 0) {
    const error = new Error('Writer webinar owner could not be resolved.');
    error.code = 'WEBINAR_MEDIA_OWNER_NOT_FOUND';
    error.nonRetryable = true;
    throw error;
  }

  return writerUserId;
}

async function getActiveMediaPlan(writerUserId) {
  const subscription = await getCurrentWebinarSubscription(writerUserId);

  if (!subscription) {
    const error = new Error('An active webinar subscription is required.');
    error.code = 'WEBINAR_SUBSCRIPTION_REQUIRED';
    error.nonRetryable = true;
    throw error;
  }

  return subscription.plan;
}

async function reconcileSourceStorage(job, writerUserId, actualSourceBytes) {
  const recordedSourceBytes = Number(job.source_size_bytes || 0);
  const delta = Number(actualSourceBytes || 0) - recordedSourceBytes;

  if (delta !== 0) {
    await recordWebinarUsage({
      writerUserId,
      usageKey: `webinar-media:${job.id}:source:reconcile`,
      eventType: 'storage',
      storageBytesDelta: delta,
      enforceStorageLimit: delta > 0,
      metadata: {
        webinar_id: Number(job.webinar_id),
        media_job_id: Number(job.id),
        storage_kind: 'source_mp4',
        action: 'reconcile',
        previous_bytes: recordedSourceBytes,
        actual_bytes: Number(actualSourceBytes || 0),
      },
    });

    await pool.query(
      `
      UPDATE webinar_media_jobs
      SET
        source_size_bytes = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [actualSourceBytes, job.id]
    );

    job.source_size_bytes = actualSourceBytes;
  }
}

async function reserveHlsStorage(
  job,
  writerUserId,
  { bucket, prefix, hlsSizeBytes }
) {
  const previousBytes = Number(job.hls_size_bytes || 0);
  const nextBytes = Number(hlsSizeBytes || 0);
  const delta = nextBytes - previousBytes;

  if (delta !== 0) {
    await recordWebinarUsage({
      writerUserId,
      usageKey: `webinar-media:${job.id}:hls:reconcile:attempt:${job.attempts}`,
      eventType: 'storage',
      storageBytesDelta: delta,
      enforceStorageLimit: delta > 0,
      metadata: {
        webinar_id: Number(job.webinar_id),
        media_job_id: Number(job.id),
        storage_kind: 'hls',
        action: 'reconcile',
        previous_bytes: previousBytes,
        actual_bytes: nextBytes,
        attempt: Number(job.attempts || 0),
      },
    });
  }

  await pool.query(
    `
    UPDATE webinar_media_jobs
    SET
      hls_bucket = ?,
      hls_prefix = ?,
      hls_size_bytes = ?,
      hls_storage_accounted_at = COALESCE(hls_storage_accounted_at, NOW()),
      hls_deleted_at = NULL,
      updated_at = NOW()
    WHERE id = ?
    `,
    [bucket, prefix, nextBytes, job.id]
  );

  job.hls_bucket = bucket;
  job.hls_prefix = prefix;
  job.hls_size_bytes = nextBytes;
  job.hls_storage_accounted_at =
    job.hls_storage_accounted_at || new Date();
  job.hls_deleted_at = null;
}

async function deleteS3Prefix(bucket, prefix) {
  if (!bucket || !prefix) return;

  let continuationToken = undefined;

  do {
    const page = await getS3Client().send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix.endsWith('/') ? prefix : `${prefix}/`,
        ContinuationToken: continuationToken,
      })
    );

    const objects = Array.isArray(page.Contents)
      ? page.Contents
          .map((item) => item?.Key)
          .filter(Boolean)
          .map((Key) => ({ Key }))
      : [];

    if (objects.length > 0) {
      await getS3Client().send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects,
            Quiet: true,
          },
        })
      );
    }

    continuationToken = page.IsTruncated
      ? page.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

async function releaseSourceStorage(job, writerUserId) {
  if (job.source_deleted_at) return;

  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: job.source_bucket || getWebinarBucketName(),
      Key: job.source_key,
    })
  );

  if (job.source_storage_accounted_at && Number(job.source_size_bytes || 0) > 0) {
    await recordWebinarUsage({
      writerUserId,
      usageKey: `webinar-media:${job.id}:source:remove`,
      eventType: 'storage',
      storageBytesDelta: -Number(job.source_size_bytes || 0),
      metadata: {
        webinar_id: Number(job.webinar_id),
        media_job_id: Number(job.id),
        storage_kind: 'source_mp4',
        action: 'remove',
      },
    });
  }

  await pool.query(
    `
    UPDATE webinar_media_jobs
    SET
      source_deleted_at = NOW(),
      updated_at = NOW()
    WHERE id = ?
    `,
    [job.id]
  );

  job.source_deleted_at = new Date();
}

async function releaseHlsStorage(job, writerUserId) {
  if (job.hls_deleted_at || !job.hls_prefix) return;

  await deleteS3Prefix(
    job.hls_bucket || job.source_bucket || getWebinarBucketName(),
    job.hls_prefix
  );

  if (job.hls_storage_accounted_at && Number(job.hls_size_bytes || 0) > 0) {
    await recordWebinarUsage({
      writerUserId,
      usageKey: `webinar-media:${job.id}:hls:remove`,
      eventType: 'storage',
      storageBytesDelta: -Number(job.hls_size_bytes || 0),
      metadata: {
        webinar_id: Number(job.webinar_id),
        media_job_id: Number(job.id),
        storage_kind: 'hls',
        action: 'remove',
      },
    });
  }

  await pool.query(
    `
    UPDATE webinar_media_jobs
    SET
      hls_deleted_at = NOW(),
      updated_at = NOW()
    WHERE id = ?
    `,
    [job.id]
  );

  job.hls_deleted_at = new Date();
}

async function cleanupSupersededMedia(job, writerUserId) {
  const [rows] = await pool.query(
    `
    SELECT *
    FROM webinar_media_jobs
    WHERE webinar_id = ?
      AND id <> ?
      AND id < ?
    ORDER BY id ASC
    `,
    [job.webinar_id, job.id, job.id]
  );

  for (const oldJob of rows) {
    await pool.query(
      `
      UPDATE webinar_media_jobs
      SET
        status = 'superseded',
        updated_at = NOW()
      WHERE id = ?
      `,
      [oldJob.id]
    );

    try {
      await releaseSourceStorage(oldJob, writerUserId);
    } catch (error) {
      console.error('Superseded source cleanup error:', error.message);
    }

    try {
      await releaseHlsStorage(oldJob, writerUserId);
    } catch (error) {
      console.error('Superseded HLS cleanup error:', error.message);
    }
  }
}

async function uploadHlsDirectory(bucket, prefix, outputRoot) {
  const files = await listFilesRecursive(outputRoot);

  const configuredUploadConcurrency = Number.parseInt(
    process.env.WEBINAR_HLS_UPLOAD_CONCURRENCY || "6",
    10
  );
  const uploadConcurrency = Math.max(
    1,
    Math.min(
      Number.isFinite(configuredUploadConcurrency)
        ? configuredUploadConcurrency
        : 6,
      12
    )
  );

  let nextUploadIndex = 0;

  async function uploadNextFile() {
    while (true) {
      const uploadIndex = nextUploadIndex++;

      if (uploadIndex >= files.length) {
        return;
      }

      const absolute = files[uploadIndex];
      const relative = path
        .relative(outputRoot, absolute)
        .split(path.sep)
        .join('/');

      const key = `${prefix}/${relative}`;
      const contentType = contentTypeForFile(relative);
      const cacheControl = relative.endsWith('.m3u8')
        ? 'public, max-age=60'
        : 'public, max-age=31536000, immutable';

      await getS3Client().send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: fs.createReadStream(absolute),
          ContentType: contentType,
          CacheControl: cacheControl,
        })
      );
    }
  }

  const uploadWorkerCount = Math.min(
    uploadConcurrency,
    files.length
  );

  if (uploadWorkerCount > 0) {
    await Promise.all(
      Array.from({ length: uploadWorkerCount }, () => uploadNextFile())
    );
  }
}

async function transcodeMediaJob(job) {
  const bucket = job.source_bucket || getWebinarBucketName();
  const workingRoot = await fsp.mkdtemp(
    path.join(os.tmpdir(), `bloggad-webinar-${job.id}-`)
  );
  const inputPath = path.join(workingRoot, 'source.mp4');
  const outputRoot = path.join(workingRoot, 'hls');
  let writerUserId = null;

  try {
    await fsp.mkdir(outputRoot, { recursive: true });
    await updateMediaProgress(job.id, 'downloading_source', 5);
    let lastDownloadPercent = 5;
    await downloadSource(bucket, job.source_key, inputPath, (loaded, total) => {
      const nextPercent = total > 0 ? Math.min(30, 5 + Math.floor((loaded / total) * 25)) : 10;
      if (nextPercent > lastDownloadPercent) {
        lastDownloadPercent = nextPercent;
        updateMediaProgress(job.id, 'downloading_source', nextPercent).catch(() => {});
      }
    });
    await updateMediaProgress(job.id, 'analyzing_video', 35);

    writerUserId = await getWriterUserIdForWebinar(job.webinar_id);
    const plan = await getActiveMediaPlan(writerUserId);
    const sourceStats = await fsp.stat(inputPath);

    await reconcileSourceStorage(
      job,
      writerUserId,
      Number(sourceStats.size || 0)
    );

    const source = await probeVideo(inputPath);
    await updateMediaProgress(job.id, 'creating_hls', 40);
    const maxDuration = Number(plan.max_video_duration_seconds || 0);

    if (maxDuration > 0 && Number(source.duration || 0) > maxDuration) {
      const error = new Error(
        `This video exceeds the plan maximum duration of ${maxDuration} seconds.`
      );
      error.code = 'WEBINAR_VIDEO_DURATION_LIMIT_EXCEEDED';
      error.nonRetryable = true;
      error.cleanupSource = true;
      throw error;
    }

    const profiles = chooseRenditions(source.height);
    const rendered = [];

    for (const profile of profiles) {
      rendered.push(
        await transcodeRendition(inputPath, outputRoot, profile)
      );
    }

    await fsp.writeFile(
      path.join(outputRoot, 'master.m3u8'),
      createMasterPlaylist(rendered),
      'utf8'
    );

    if (!(await isLatestMediaJob(job.webinar_id, job.id))) {
      const error = new Error('This media job was superseded by a newer upload.');
      error.code = 'WEBINAR_MEDIA_SUPERSEDED';
      error.nonRetryable = true;
      error.cleanupSource = true;
      throw error;
    }

    const hlsSizeBytes = await directorySizeBytes(outputRoot);
    const hlsPrefix = `webinars/hls/${job.webinar_id}/${job.id}`;

    await reserveHlsStorage(job, writerUserId, {
      bucket,
      prefix: hlsPrefix,
      hlsSizeBytes,
    });

    await deleteS3Prefix(bucket, hlsPrefix);
    await uploadHlsDirectory(bucket, hlsPrefix, outputRoot);

    return {
      durationSeconds: source.duration,
      sourceHeight: source.height,
      hlsBucket: bucket,
      hlsPrefix,
      masterKey: `${hlsPrefix}/master.m3u8`,
      hlsSizeBytes,
      writerUserId,
    };
  } catch (error) {
    if (error?.code === 'WEBINAR_STORAGE_LIMIT_EXCEEDED') {
      error.nonRetryable = true;
      error.cleanupSource = true;
    }

    if (
      writerUserId &&
      error?.cleanupSource &&
      !job.source_deleted_at
    ) {
      try {
        await releaseSourceStorage(job, writerUserId);
      } catch (cleanupError) {
        console.error('Media source cleanup error:', cleanupError.message);
      }
    }

    throw error;
  } finally {
    await fsp.rm(workingRoot, { recursive: true, force: true });
  }
}

async function claimNextMediaJob() {
  const [jobs] = await pool.query(
    `
    SELECT *
    FROM webinar_media_jobs
    WHERE status = 'queued'
      AND attempts < 3
      AND source_storage_accounted_at IS NOT NULL
      AND source_deleted_at IS NULL
    ORDER BY id ASC
    LIMIT 1
    `
  );

  const job = jobs[0];

  if (!job) return null;

  const [claim] = await pool.query(
    `
    UPDATE webinar_media_jobs
    SET
      status = 'processing',
      attempts = attempts + 1,
      claimed_at = NOW(),
      started_at = COALESCE(started_at, NOW()),
      updated_at = NOW()
    WHERE id = ?
      AND status = 'queued'
    `,
    [job.id]
  );

  if (!claim.affectedRows) return null;

  const [[claimed]] = await pool.query(
    `
    SELECT *
    FROM webinar_media_jobs
    WHERE id = ?
    LIMIT 1
    `,
    [job.id]
  );

  return claimed || null;
}

async function isLatestMediaJob(webinarId, mediaJobId) {
  const [[latest]] = await pool.query(
    `
    SELECT id
    FROM webinar_media_jobs
    WHERE webinar_id = ?
      AND status <> 'superseded'
    ORDER BY id DESC
    LIMIT 1
    `,
    [webinarId]
  );

  return Number(latest?.id || 0) === Number(mediaJobId);
}

async function completeMediaJob(job, output) {
  const latest = await isLatestMediaJob(job.webinar_id, job.id);

  if (!latest) {
    await pool.query(
      `
      UPDATE webinar_media_jobs
      SET
        status = 'superseded',
        updated_at = NOW()
      WHERE id = ?
      `,
      [job.id]
    );

    try {
      await releaseSourceStorage(job, output.writerUserId);
    } catch (error) {
      console.error('Superseded source cleanup error:', error.message);
    }

    const supersededHlsJob = {
      ...job,
      hls_bucket: output.hlsBucket,
      hls_prefix: output.hlsPrefix,
      hls_size_bytes: output.hlsSizeBytes,
      hls_storage_accounted_at: new Date(),
    };

    try {
      await releaseHlsStorage(supersededHlsJob, output.writerUserId);
    } catch (error) {
      console.error('Superseded HLS cleanup error:', error.message);
    }

    return;
  }

  await pool.query(
    `
    UPDATE webinar_media_jobs
    SET
      status = 'ready',
      processing_stage = 'ready',
      progress_percent = 100,
      stage_updated_at = NOW(),
      duration_seconds = ?,
      source_height = ?,
      hls_bucket = ?,
      hls_prefix = ?,
      hls_master_key = ?,
      hls_size_bytes = ?,
      hls_storage_accounted_at = COALESCE(hls_storage_accounted_at, NOW()),
      error_message = NULL,
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = ?
    `,
    [
      output.durationSeconds,
      output.sourceHeight,
      output.hlsBucket,
      output.hlsPrefix,
      output.masterKey,
      output.hlsSizeBytes,
      job.id,
    ]
  );

  await pool.query(
    `
    UPDATE webinars
    SET
      status = 'ready',
      processing_stage = 'ready',
      progress_percent = 100,
      stage_updated_at = NOW(),
      duration_seconds = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [output.durationSeconds, job.webinar_id]
  );

  const [[freshJob]] = await pool.query(
    `
    SELECT *
    FROM webinar_media_jobs
    WHERE id = ?
    LIMIT 1
    `,
    [job.id]
  );

  if (freshJob) {
    try {
      await releaseSourceStorage(freshJob, output.writerUserId);
    } catch (error) {
      console.error('Ready source cleanup error:', error.message);
    }
  }

  await cleanupSupersededMedia(job, output.writerUserId);
}

async function failMediaJob(job, error) {
  const message = String(error?.message || 'Webinar transcoding failed').slice(
    0,
    10000
  );

  const [[current]] = await pool.query(
    `
    SELECT *
    FROM webinar_media_jobs
    WHERE id = ?
    LIMIT 1
    `,
    [job.id]
  );

  const nonRetryable = Boolean(error?.nonRetryable);
  const superseded = error?.code === 'WEBINAR_MEDIA_SUPERSEDED';
  const finalFailure = nonRetryable || Number(current?.attempts || 0) >= 3;
  const nextStatus = superseded
    ? 'superseded'
    : finalFailure
      ? 'failed'
      : 'queued';

  await pool.query(
    `
    UPDATE webinar_media_jobs
    SET
      status = ?,
      error_message = ?,
      claimed_at = NULL,
      updated_at = NOW()
    WHERE id = ?
    `,
    [nextStatus, message, job.id]
  );

  if (finalFailure && current?.hls_storage_accounted_at) {
    try {
      const writerUserId = await getWriterUserIdForWebinar(job.webinar_id);
      await releaseHlsStorage(current, writerUserId);
    } catch (cleanupError) {
      console.error('Final HLS cleanup error:', cleanupError.message);
    }
  }

  if (
    finalFailure &&
    !superseded &&
    (await isLatestMediaJob(job.webinar_id, job.id))
  ) {
    await pool.query(
      `
      UPDATE webinars
      SET
        status = 'error',
        updated_at = NOW()
      WHERE id = ?
      `,
      [job.webinar_id]
    );
  }
}

let processingStartupMaintenanceDone = false;
async function runProcessingStartupMaintenance() {
  if (processingStartupMaintenanceDone) return;
  processingStartupMaintenanceDone = true;
  const staleMinutes = Math.max(5, Number(process.env.WEBINAR_PROCESSING_STALE_MINUTES || 30));
  await pool.query(`UPDATE webinar_media_jobs SET status = 'queued', processing_stage = 'queued', progress_percent = 0, claimed_at = NULL, stage_updated_at = NOW(), updated_at = NOW() WHERE status = 'processing' AND claimed_at < TIMESTAMPADD(MINUTE, -?, NOW()) AND attempts < 3`, [staleMinutes]);
  const names = await fsp.readdir(os.tmpdir()).catch(() => []);
  const cutoff = Date.now() - (6 * 60 * 60 * 1000);
  await Promise.all(names.filter((name) => name.startsWith('bloggad-webinar-')).map(async (name) => {
    const target = path.join(os.tmpdir(), name);
    const details = await fsp.stat(target).catch(() => null);
    if (details && details.mtimeMs < cutoff) await fsp.rm(target, { recursive: true, force: true });
  }));
}

// WEBINAR_PROCESSING_STAGES_RECOVERY_V1
async function processNextQueuedMediaJob() {
  await runProcessingStartupMaintenance();
  const job = await claimNextMediaJob();

  if (!job) {
    return {
      processed: false,
    };
  }

  try {
    const output = await transcodeMediaJob(job);
    await completeMediaJob(job, output);

    return {
      processed: true,
      mediaJobId: job.id,
      webinarId: job.webinar_id,
      status: 'ready',
    };
  } catch (error) {
    await failMediaJob(job, error);
    throw error;
  }
}

module.exports = {
  processNextQueuedMediaJob,
  transcodeMediaJob,
  probeVideo,
  createMasterPlaylist,
};
