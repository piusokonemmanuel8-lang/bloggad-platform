const crypto = require('crypto');
const {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  HeadObjectCommand,
  UploadPartCommand,
} = require('@aws-sdk/client-s3');
const {
  CreateJobCommand,
  GetJobCommand,
  MediaConvertClient,
} = require('@aws-sdk/client-mediaconvert');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pool = require('../config/db');
const { getS3Client } = require('../config/s3Storage');
const { getWebinarBucketName } = require('../config/webinarStorage');
const {
  assertWebinarEntitlement,
  recordWebinarUsage,
} = require('./webinarUsageService');

const MIN_PART_BYTES = 5 * 1024 * 1024;
const DEFAULT_PART_BYTES = 16 * 1024 * 1024;
let mediaConvertClient;

function text(value, maxLength = 1024) {
  return String(value || '').trim().slice(0, maxLength);
}

function positiveInt(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function providerEnabled() {
  return text(process.env.WEBINAR_TRANSCODE_PROVIDER, 40).toLowerCase() ===
    'mediaconvert';
}

function configuration() {
  const region = text(
    process.env.WEBINAR_MEDIACONVERT_REGION ||
      process.env.AWS_REGION,
    100
  );
  const role = text(process.env.WEBINAR_MEDIACONVERT_ROLE_ARN, 2048);
  const queue = text(process.env.WEBINAR_MEDIACONVERT_QUEUE_ARN, 2048);
  const bucket = text(
    process.env.WEBINAR_MEDIACONVERT_OUTPUT_BUCKET ||
      process.env.AWS_WEBINAR_S3_BUCKET ||
      getWebinarBucketName(),
    255
  );
  const prefix = text(
    process.env.WEBINAR_MEDIACONVERT_OUTPUT_PREFIX || 'webinars/hls',
    500
  ).replace(/^\/+|\/+$/g, '');

  if (!region || !role || !queue || !bucket) {
    const error = new Error('MediaConvert environment is incomplete.');
    error.status = 503;
    throw error;
  }

  return { region, role, queue, bucket, prefix };
}

function getMediaConvertClient() {
  if (!mediaConvertClient) {
    mediaConvertClient = new MediaConvertClient({
      region: configuration().region,
    });
  }

  return mediaConvertClient;
}

function validateMp4(filename, mime) {
  const cleanName = text(filename, 255);
  const cleanMime = text(mime, 100).toLowerCase();

  if (
    !cleanName.toLowerCase().endsWith('.mp4') &&
    cleanMime !== 'video/mp4'
  ) {
    const error = new Error('Only MP4 webinar videos are supported.');
    error.status = 400;
    throw error;
  }

  return cleanName || 'webinar-video.mp4';
}

function assertUploadKey(key, userId, webinarId) {
  const cleanKey = text(key, 1024).replace(/^\/+/, '');
  const expected = `webinars/source/${userId}/${webinarId}/`;

  if (!cleanKey.startsWith(expected) || !cleanKey.endsWith('.mp4')) {
    const error = new Error('Invalid webinar upload key.');
    error.status = 403;
    throw error;
  }

  return cleanKey;
}

function sendError(res, error, fallback) {
  const status = Number(error?.status || 500);

  return res
    .status(Number.isInteger(status) && status >= 400 ? status : 500)
    .json({
      ok: false,
      code: error?.code || null,
      message: error?.message || fallback,
    });
}

function videoOutput(height, bitrate, nameModifier) {
  return {
    NameModifier: nameModifier,
    ContainerSettings: {
      Container: 'M3U8',
      M3u8Settings: {},
    },
    VideoDescription: {
      Height: height,
      ScalingBehavior: 'DEFAULT',
      CodecSettings: {
        Codec: 'H_264',
        H264Settings: {
          Bitrate: bitrate,
          RateControlMode: 'CBR',
          CodecProfile: 'MAIN',
          CodecLevel: 'AUTO',
          FramerateControl: 'INITIALIZE_FROM_SOURCE',
          GopSize: 6,
          GopSizeUnits: 'SECONDS',
          NumberBFramesBetweenReferenceFrames: 2,
          SceneChangeDetect: 'ENABLED',
          ParControl: 'INITIALIZE_FROM_SOURCE',
        },
      },
    },
    AudioDescriptions: [
      {
        AudioSourceName: 'Audio Selector 1',
        CodecSettings: {
          Codec: 'AAC',
          AacSettings: {
            Bitrate: 128000,
            CodingMode: 'CODING_MODE_2_0',
            SampleRate: 48000,
          },
        },
      },
    ],
  };
}

async function submitMediaConvertJob(mediaJob) {
  const config = configuration();
  const hlsPrefix =
    `${config.prefix}/${mediaJob.webinar_id}/${mediaJob.id}`;
  const destination = `s3://${config.bucket}/${hlsPrefix}/master`;
  const source = `s3://${mediaJob.source_bucket}/${mediaJob.source_key}`;

  const result = await getMediaConvertClient().send(
    new CreateJobCommand({
      Role: config.role,
      Queue: config.queue,
      ClientRequestToken: `bloggad-webinar-${mediaJob.id}-${Number(mediaJob.attempts || 0)}`,
      UserMetadata: {
        application: 'bloggad',
        webinar_id: String(mediaJob.webinar_id),
        media_job_id: String(mediaJob.id),
      },
      Settings: {
        TimecodeConfig: {
          Source: 'ZEROBASED',
        },
        Inputs: [
          {
            FileInput: source,
            AudioSelectors: {
              'Audio Selector 1': {
                DefaultSelection: 'DEFAULT',
              },
            },
            VideoSelector: {},
            TimecodeSource: 'ZEROBASED',
          },
        ],
        OutputGroups: [
          {
            Name: 'Bloggad HLS',
            OutputGroupSettings: {
              Type: 'HLS_GROUP_SETTINGS',
              HlsGroupSettings: {
                Destination: destination,
                SegmentLength: 6,
                MinSegmentLength: 0,
                ManifestDurationFormat: 'INTEGER',
                OutputSelection: 'MANIFESTS_AND_SEGMENTS',
                StreamInfResolution: 'INCLUDE',
                DirectoryStructure: 'SINGLE_DIRECTORY',
              },
            },
            Outputs: [
              videoOutput(360, 800000, '_360p'),
              videoOutput(720, 2500000, '_720p'),
              videoOutput(1080, 5000000, '_1080p'),
            ],
          },
        ],
      },
      StatusUpdateInterval: 'SECONDS_60',
      Priority: 0,
    })
  );

  const providerJobId = text(result?.Job?.Id, 255);

  if (!providerJobId) {
    throw new Error('MediaConvert did not return a job ID.');
  }

  await pool.query(
    `
    UPDATE webinar_media_jobs
    SET
      provider = 'mediaconvert',
      provider_job_id = ?,
      status = 'processing',
      processing_stage = 'submitted_to_mediaconvert',
      progress_percent = 1,
      hls_bucket = ?,
      hls_prefix = ?,
      hls_master_key = ?,
      claimed_at = NOW(),
      started_at = COALESCE(started_at, NOW()),
      stage_updated_at = NOW(),
      updated_at = NOW()
    WHERE id = ?
    `,
    [
      providerJobId,
      config.bucket,
      hlsPrefix,
      `${hlsPrefix}/master.m3u8`,
      mediaJob.id,
    ]
  );

  return providerJobId;
}

async function initiateMultipartUpload(req, res) {
  try {
    if (!providerEnabled()) {
      const error = new Error('MediaConvert upload is not enabled.');
      error.status = 503;
      throw error;
    }

    await assertWebinarEntitlement(req.user.id, 'upload');

    const filename = validateMp4(
      req.body?.filename,
      req.body?.content_type
    );
    const size = Number(req.body?.size || 0);
    const maximum = Math.max(
      10 * 1024 * 1024,
      Number(
        process.env.WEBINAR_MAX_UPLOAD_BYTES ||
          5 * 1024 * 1024 * 1024
      )
    );

    if (!Number.isSafeInteger(size) || size <= 0 || size > maximum) {
      const error = new Error('Invalid webinar video size.');
      error.status = 413;
      throw error;
    }

    const bucket = getWebinarBucketName();
    const key =
      `webinars/source/${req.user.id}/${req.webinar.id}/` +
      `${Date.now()}-${crypto.randomUUID()}.mp4`;

    const result = await getS3Client().send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: 'video/mp4',
        CacheControl: 'private, no-store',
        Metadata: {
          webinar_id: String(req.webinar.id),
          writer_user_id: String(req.user.id),
          original_filename: filename.slice(0, 200),
        },
      })
    );

    return res.status(201).json({
      ok: true,
      upload_id: result.UploadId,
      bucket,
      key,
      part_size: DEFAULT_PART_BYTES,
      expires_in: 3600,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to start webinar upload.');
  }
}

async function signMultipartPart(req, res) {
  try {
    const uploadId = text(req.body?.upload_id, 2048);
    const key = assertUploadKey(
      req.body?.key,
      req.user.id,
      req.webinar.id
    );
    const partNumber = positiveInt(req.body?.part_number);

    if (!uploadId || !partNumber || partNumber > 10000) {
      const error = new Error('Invalid multipart upload part.');
      error.status = 400;
      throw error;
    }

    const command = new UploadPartCommand({
      Bucket: getWebinarBucketName(),
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    const url = await getSignedUrl(getS3Client(), command, {
      expiresIn: 3600,
    });

    return res.status(200).json({
      ok: true,
      part_number: partNumber,
      url,
    });
  } catch (error) {
    return sendError(res, error, 'Failed to authorize upload part.');
  }
}

async function completeMultipartUpload(req, res) {
  const connection = await pool.getConnection();
  let committed = false;
  let mediaJobId = null;

  try {
    const uploadId = text(req.body?.upload_id, 2048);
    const key = assertUploadKey(
      req.body?.key,
      req.user.id,
      req.webinar.id
    );
    const filename = validateMp4(
      req.body?.filename,
      req.body?.content_type
    );
    const requestedSize = Number(req.body?.size || 0);
    const overview =
      req.webinarSubscriptionOverview ||
      (await assertWebinarEntitlement(req.user.id, 'upload'));
    const remainingStorage = overview?.usage?.remaining?.storage_bytes;

    if (
      remainingStorage !== null &&
      remainingStorage !== undefined &&
      requestedSize > Number(remainingStorage)
    ) {
      const error = new Error(
        'This video exceeds the remaining webinar storage allowance.'
      );
      error.status = 413;
      error.code = 'WEBINAR_STORAGE_LIMIT_EXCEEDED';
      throw error;
    }

    const parts = Array.isArray(req.body?.parts)
      ? req.body.parts
          .map((part) => ({
            ETag: text(part?.etag, 500),
            PartNumber: positiveInt(part?.part_number),
          }))
          .filter((part) => part.ETag && part.PartNumber)
          .sort((a, b) => a.PartNumber - b.PartNumber)
      : [];

    if (!uploadId || !parts.length || requestedSize <= 0) {
      const error = new Error('Incomplete multipart upload information.');
      error.status = 400;
      throw error;
    }

    const bucket = getWebinarBucketName();

    await getS3Client().send(
      new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts,
        },
      })
    );

    const head = await getS3Client().send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const actualSize = Number(head.ContentLength || 0);

    if (!actualSize) {
      throw new Error('Uploaded webinar video is empty.');
    }

    await connection.beginTransaction();

    await connection.query(
      `
      UPDATE webinar_media_jobs
      SET status = 'superseded', updated_at = NOW()
      WHERE webinar_id = ?
        AND status IN ('queued', 'failed')
      `,
      [req.webinar.id]
    );

    const [insert] = await connection.query(
      `
      INSERT INTO webinar_media_jobs (
        webinar_id,
        source_bucket,
        source_key,
        source_filename,
        source_mime,
        source_size_bytes,
        status,
        processing_stage,
        progress_percent,
        attempts,
        provider,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'video/mp4', ?, 'queued', 'queued', 0, 0,
        'mediaconvert', NOW(), NOW())
      `,
      [
        req.webinar.id,
        bucket,
        key,
        filename,
        actualSize,
      ]
    );

    mediaJobId = Number(insert.insertId);

    await connection.query(
      `
      UPDATE webinars
      SET
        status = 'processing',
        processing_stage = 'queued',
        progress_percent = 0,
        stage_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [req.webinar.id]
    );

    await connection.commit();
    committed = true;

    await recordWebinarUsage({
      writerUserId: req.user.id,
      usageKey: `webinar-media:${mediaJobId}:source:add`,
      eventType: 'storage',
      storageBytesDelta: actualSize,
      enforceStorageLimit: true,
      metadata: {
        webinar_id: Number(req.webinar.id),
        media_job_id: mediaJobId,
        storage_kind: 'source_mp4',
        action: 'add',
      },
    });

    await pool.query(
      `
      UPDATE webinar_media_jobs
      SET source_storage_accounted_at = NOW(), updated_at = NOW()
      WHERE id = ?
      `,
      [mediaJobId]
    );

    const mediaJob = {
      id: mediaJobId,
      webinar_id: Number(req.webinar.id),
      source_bucket: bucket,
      source_key: key,
    };

    const providerJobId = await submitMediaConvertJob(mediaJob);

    return res.status(202).json({
      ok: true,
      message:
        'Webinar upload confirmed and MediaConvert processing started.',
      media_job_id: mediaJobId,
      provider_job_id: providerJobId,
      status: 'processing',
    });
  } catch (error) {
    if (!committed) {
      try {
        await connection.rollback();
      } catch {}
    } else if (mediaJobId) {
      const message = text(
        error?.message || 'MediaConvert job submission failed.',
        10000
      );
      try {
        await pool.query(
          `
          UPDATE webinar_media_jobs
          SET
            status = 'failed',
            processing_stage = 'failed',
            error_message = ?,
            stage_updated_at = NOW(),
            updated_at = NOW()
          WHERE id = ?
          `,
          [message, mediaJobId]
        );
        await pool.query(
          `UPDATE webinars SET status = 'error', updated_at = NOW() WHERE id = ?`,
          [req.webinar.id]
        );
      } catch (statusError) {
        console.error(
          'MediaConvert submission failure status update error:',
          statusError.message
        );
      }
    }

    return sendError(res, error, 'Failed to complete webinar upload.');
  } finally {
    connection.release();
  }
}

async function abortMultipartUpload(req, res) {
  try {
    const uploadId = text(req.body?.upload_id, 2048);
    const key = assertUploadKey(
      req.body?.key,
      req.user.id,
      req.webinar.id
    );

    if (!uploadId) {
      const error = new Error('Upload ID is required.');
      error.status = 400;
      throw error;
    }

    await getS3Client().send(
      new AbortMultipartUploadCommand({
        Bucket: getWebinarBucketName(),
        Key: key,
        UploadId: uploadId,
      })
    );

    return res.status(200).json({
      ok: true,
      message: 'Multipart upload aborted.',
    });
  } catch (error) {
    return sendError(res, error, 'Failed to abort webinar upload.');
  }
}


// BLOGGAD_MEDIACONVERT_HARDENING_V1
async function retryMediaConvertJob(req, res) {
  try {
    const mediaJobId = positiveInt(req.params?.mediaJobId);

    if (!mediaJobId) {
      const error = new Error('Valid media job ID is required.');
      error.status = 400;
      throw error;
    }

    await assertWebinarEntitlement(req.user.id, 'upload');

    const [[job]] = await pool.query(
      `
      SELECT *
      FROM webinar_media_jobs
      WHERE id = ?
        AND webinar_id = ?
        AND provider = 'mediaconvert'
        AND status = 'failed'
        AND source_deleted_at IS NULL
      LIMIT 1
      `,
      [mediaJobId, req.webinar.id]
    );

    if (!job) {
      const error = new Error(
        'Only a failed MediaConvert job with its source video can be retried.'
      );
      error.status = 409;
      throw error;
    }

    if (Number(job.attempts || 0) >= 3) {
      const error = new Error('This media job has reached its retry limit.');
      error.status = 409;
      throw error;
    }

    const attempts = Number(job.attempts || 0) + 1;

    await pool.query(
      `
      UPDATE webinar_media_jobs
      SET
        status = 'queued',
        attempts = ?,
        provider_job_id = NULL,
        processing_stage = 'queued',
        progress_percent = 0,
        claimed_at = NULL,
        error_message = NULL,
        stage_updated_at = NOW(),
        updated_at = NOW()
      WHERE id = ?
      `,
      [attempts, mediaJobId]
    );

    try {
      const providerJobId = await submitMediaConvertJob({
        ...job,
        attempts,
      });

      return res.status(202).json({
        ok: true,
        message: 'MediaConvert retry started.',
        media_job_id: mediaJobId,
        provider_job_id: providerJobId,
        status: 'processing',
      });
    } catch (error) {
      await pool.query(
        `
        UPDATE webinar_media_jobs
        SET
          status = 'failed',
          processing_stage = 'failed',
          error_message = ?,
          stage_updated_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
        `,
        [text(error?.message || 'MediaConvert retry failed.', 10000), mediaJobId]
      );
      throw error;
    }
  } catch (error) {
    return sendError(res, error, 'Failed to retry webinar media.');
  }
}
async function syncOwnedWebinarMedia(req, res, next) {
  try {
    if (!providerEnabled()) {
      next();
      return;
    }

    const [[media]] = await pool.query(
      `
      SELECT *
      FROM webinar_media_jobs
      WHERE webinar_id = ?
        AND provider = 'mediaconvert'
        AND provider_job_id IS NOT NULL
        AND status = 'processing'
      ORDER BY id DESC
      LIMIT 1
      `,
      [req.webinar.id]
    );

    if (!media) {
      next();
      return;
    }

    const result = await getMediaConvertClient().send(
      new GetJobCommand({
        Id: media.provider_job_id,
      })
    );

    const job = result.Job || {};
    const providerStatus = text(job.Status, 40).toUpperCase();
    const progress = Math.max(
      1,
      Math.min(99, Number(job.JobPercentComplete || 1))
    );

    if (providerStatus === 'COMPLETE') {
      await pool.query(
        `
        UPDATE webinar_media_jobs
        SET
          status = 'ready',
          processing_stage = 'ready',
          progress_percent = 100,
          completed_at = NOW(),
          stage_updated_at = NOW(),
          error_message = NULL,
          updated_at = NOW()
        WHERE id = ?
        `,
        [media.id]
      );

      await pool.query(
        `
        UPDATE webinars
        SET
          status = 'ready',
          processing_stage = 'ready',
          progress_percent = 100,
          stage_updated_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
        `,
        [req.webinar.id]
      );
    } else if (
      providerStatus === 'ERROR' ||
      providerStatus === 'CANCELED'
    ) {
      const message = text(
        job.ErrorMessage ||
          `MediaConvert finished with status ${providerStatus}.`,
        10000
      );

      await pool.query(
        `
        UPDATE webinar_media_jobs
        SET
          status = 'failed',
          processing_stage = 'failed',
          error_message = ?,
          stage_updated_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
        `,
        [message, media.id]
      );

      await pool.query(
        `
        UPDATE webinars
        SET status = 'error', updated_at = NOW()
        WHERE id = ?
        `,
        [req.webinar.id]
      );
    } else {
      await pool.query(
        `
        UPDATE webinar_media_jobs
        SET
          processing_stage = 'mediaconvert_processing',
          progress_percent = ?,
          stage_updated_at = NOW(),
          updated_at = NOW()
        WHERE id = ?
        `,
        [progress, media.id]
      );
    }

    next();
  } catch (error) {
    console.error('syncOwnedWebinarMedia error:', error.message);
    next();
  }
}

module.exports = {
  initiateMultipartUpload,
  signMultipartPart,
  completeMultipartUpload,
  abortMultipartUpload,
  retryMediaConvertJob,
  syncOwnedWebinarMedia,
};