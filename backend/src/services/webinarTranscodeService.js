const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const {
  GetObjectCommand,
  PutObjectCommand,
} = require('@aws-sdk/client-s3');
const pool = require('../config/db');
const { getS3Client } = require('../config/s3Storage');
const { getWebinarBucketName } = require('../config/webinarStorage');

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

async function downloadSource(bucket, key, targetPath) {
  const object = await getS3Client().send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!object.Body) {
    throw new Error('Webinar source object has no body');
  }

  await pipeline(object.Body, fs.createWriteStream(targetPath));
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

  try {
    await fsp.mkdir(outputRoot, { recursive: true });
    await downloadSource(bucket, job.source_key, inputPath);

    const source = await probeVideo(inputPath);
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

    const hlsPrefix = `webinars/hls/${job.webinar_id}/${job.id}`;
    await uploadHlsDirectory(bucket, hlsPrefix, outputRoot);

    return {
      durationSeconds: source.duration,
      sourceHeight: source.height,
      hlsBucket: bucket,
      hlsPrefix,
      masterKey: `${hlsPrefix}/master.m3u8`,
    };
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
  await pool.query(
    `
    UPDATE webinar_media_jobs
    SET
      status = 'ready',
      duration_seconds = ?,
      source_height = ?,
      hls_bucket = ?,
      hls_prefix = ?,
      hls_master_key = ?,
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
      job.id,
    ]
  );

  if (await isLatestMediaJob(job.webinar_id, job.id)) {
    await pool.query(
      `
      UPDATE webinars
      SET
        status = 'ready',
        duration_seconds = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [output.durationSeconds, job.webinar_id]
    );
  }
}

async function failMediaJob(job, error) {
  const message = String(error?.message || 'Webinar transcoding failed').slice(
    0,
    10000
  );

  const [[current]] = await pool.query(
    `
    SELECT attempts
    FROM webinar_media_jobs
    WHERE id = ?
    LIMIT 1
    `,
    [job.id]
  );

  const finalFailure = Number(current?.attempts || 0) >= 3;

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
    [finalFailure ? 'failed' : 'queued', message, job.id]
  );

  if (finalFailure && (await isLatestMediaJob(job.webinar_id, job.id))) {
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

async function processNextQueuedMediaJob() {
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
