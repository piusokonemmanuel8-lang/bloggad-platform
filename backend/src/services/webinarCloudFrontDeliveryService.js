const crypto = require('crypto');
const zlib = require('zlib');
const {
  GetObjectCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const pool = require('../config/db');
const { getS3Client } = require('../config/s3Storage');
const {
  recordWebinarUsage,
} = require('./webinarUsageService');

const HLS_PATH_PATTERN =
  /^\/webinars\/hls\/([1-9]\d*)\/([1-9]\d*)\/.+$/;

function positiveInt(value, fallback = null) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function nonNegativeInt(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.floor(number);
}

function deliveryConfig() {
  const enabled =
    String(
      process.env.WEBINAR_CLOUDFRONT_DELIVERY_ENABLED || ''
    )
      .trim()
      .toLowerCase() === 'true';

  const bucket = String(
    process.env.WEBINAR_CLOUDFRONT_LOG_BUCKET || ''
  ).trim();
  const prefix = String(
    process.env.WEBINAR_CLOUDFRONT_LOG_PREFIX || ''
  )
    .trim()
    .replace(/^\/+/g, '');
  const distributionId = String(
    process.env.WEBINAR_CLOUDFRONT_DISTRIBUTION_ID || ''
  ).trim();
  const batchSize = Math.min(
    100,
    positiveInt(
      process.env.WEBINAR_CLOUDFRONT_DELIVERY_BATCH_SIZE,
      20
    )
  );
  const scanPages = Math.min(
    100,
    positiveInt(
      process.env.WEBINAR_CLOUDFRONT_DELIVERY_SCAN_PAGES,
      10
    )
  );

  return {
    enabled,
    bucket,
    prefix,
    distributionId,
    batchSize,
    scanPages,
  };
}

function assertEnabledConfig() {
  const config = deliveryConfig();

  if (!config.enabled) {
    const error = new Error(
      'CloudFront webinar delivery accounting is disabled.'
    );
    error.code = 'WEBINAR_CLOUDFRONT_DELIVERY_DISABLED';
    throw error;
  }

  if (!config.bucket || !config.prefix || !config.distributionId) {
    const error = new Error(
      'CloudFront webinar delivery accounting configuration is incomplete.'
    );
    error.code = 'WEBINAR_CLOUDFRONT_DELIVERY_CONFIG_ERROR';
    throw error;
  }

  return config;
}

function sourceKeyHash(bucket, key) {
  return crypto
    .createHash('sha256')
    .update(`${String(bucket || '')}\n${String(key || '')}`, 'utf8')
    .digest('hex');
}

function decodeUriStem(value) {
  const raw = String(value || '').trim();

  if (!raw) return '';

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function extractWebinarHlsIdentity(uriStem) {
  const path = decodeUriStem(uriStem);
  const match = HLS_PATH_PATTERN.exec(path);

  if (!match) return null;

  return {
    webinarId: Number(match[1]),
    mediaJobId: Number(match[2]),
    path,
  };
}

function parseCloudFrontW3c(text) {
  const lines = String(text || '').split(/\r?\n/);
  let fields = null;
  const records = [];

  for (const rawLine of lines) {
    const line = String(rawLine || '');

    if (!line) continue;

    if (line.startsWith('#Fields:')) {
      fields = line
        .slice('#Fields:'.length)
        .trim()
        .split(/\s+/);
      continue;
    }

    if (line.startsWith('#')) continue;
    if (!fields || fields.length === 0) continue;

    const values = line.split('\t');

    if (values.length < fields.length) continue;

    const record = {};

    for (let index = 0; index < fields.length; index += 1) {
      record[fields[index]] = values[index];
    }

    records.push(record);
  }

  return records;
}

function summarizeRecords(records) {
  const aggregates = new Map();
  let recordsTotal = 0;
  let totalScBytes = 0;
  let hlsRecords = 0;
  let hlsScBytes = 0;

  for (const record of records || []) {
    recordsTotal += 1;

    const bytes = nonNegativeInt(record['sc-bytes']);
    totalScBytes += bytes;

    const identity = extractWebinarHlsIdentity(
      record['cs-uri-stem']
    );

    if (!identity) continue;

    hlsRecords += 1;
    hlsScBytes += bytes;

    const key =
      `${identity.webinarId}:${identity.mediaJobId}`;

    if (!aggregates.has(key)) {
      aggregates.set(key, {
        webinarId: identity.webinarId,
        mediaJobId: identity.mediaJobId,
        records: 0,
        bytes: 0,
      });
    }

    const aggregate = aggregates.get(key);
    aggregate.records += 1;
    aggregate.bytes += bytes;
  }

  return {
    recordsTotal,
    totalScBytes,
    hlsRecords,
    hlsScBytes,
    aggregates: [...aggregates.values()],
  };
}

async function bodyToBuffer(body) {
  if (!body) return Buffer.alloc(0);

  if (typeof body.transformToByteArray === 'function') {
    return Buffer.from(await body.transformToByteArray());
  }

  const chunks = [];

  for await (const chunk of body) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function decodeLogObject(buffer, key, contentEncoding) {
  const input = Buffer.isBuffer(buffer)
    ? buffer
    : Buffer.from(buffer || '');

  const isGzip =
    String(contentEncoding || '').toLowerCase().includes('gzip') ||
    String(key || '').toLowerCase().endsWith('.gz') ||
    (
      input.length >= 2 &&
      input[0] === 0x1f &&
      input[1] === 0x8b
    );

  const output = isGzip ? zlib.gunzipSync(input) : input;

  return output.toString('utf8');
}

async function loadOwnership(aggregates, connection = pool) {
  const mediaJobIds = [
    ...new Set(
      aggregates
        .map((item) => positiveInt(item.mediaJobId))
        .filter(Boolean)
    ),
  ];

  if (mediaJobIds.length === 0) return new Map();

  const placeholders = mediaJobIds.map(() => '?').join(',');

  const [rows] = await connection.query(
    `
    SELECT
      wm.id AS media_job_id,
      wm.webinar_id,
      wm.hls_prefix,
      w.user_id AS writer_user_id
    FROM webinar_media_jobs wm
    INNER JOIN webinars w
      ON w.id = wm.webinar_id
    WHERE wm.id IN (${placeholders})
    `,
    mediaJobIds
  );

  const map = new Map();

  for (const row of rows) {
    const expectedPrefix =
      `webinars/hls/${Number(row.webinar_id)}/${Number(row.media_job_id)}`;

    if (String(row.hls_prefix || '') !== expectedPrefix) {
      continue;
    }

    map.set(Number(row.media_job_id), {
      mediaJobId: Number(row.media_job_id),
      webinarId: Number(row.webinar_id),
      writerUserId: Number(row.writer_user_id),
      hlsPrefix: expectedPrefix,
    });
  }

  return map;
}

async function claimLogObject({
  bucket,
  key,
  etag = null,
  size = 0,
  lastModified = null,
}) {
  const keyHash = sourceKeyHash(bucket, key);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT *
      FROM webinar_cloudfront_log_objects
      WHERE source_key_hash = ?
      LIMIT 1
      FOR UPDATE
      `,
      [keyHash]
    );

    const existing = rows[0] || null;

    if (existing && existing.status === 'processed') {
      await connection.commit();

      return {
        claimed: false,
        processed: true,
        row: existing,
        keyHash,
      };
    }

    if (
      existing &&
      existing.status === 'processing' &&
      existing.updated_at &&
      Date.now() - new Date(existing.updated_at).getTime() <
        15 * 60 * 1000
    ) {
      await connection.commit();

      return {
        claimed: false,
        processed: false,
        row: existing,
        keyHash,
      };
    }

    if (existing) {
      await connection.query(
        `
        UPDATE webinar_cloudfront_log_objects
        SET
          source_bucket = ?,
          source_key = ?,
          source_etag = ?,
          source_size_bytes = ?,
          source_last_modified = ?,
          status = 'processing',
          attempts = attempts + 1,
          error_message = NULL,
          updated_at = NOW()
        WHERE id = ?
        `,
        [
          bucket,
          key,
          etag,
          nonNegativeInt(size),
          lastModified || null,
          existing.id,
        ]
      );

      await connection.commit();

      return {
        claimed: true,
        processed: false,
        row: {
          ...existing,
          source_bucket: bucket,
          source_key: key,
        },
        keyHash,
      };
    }

    const [result] = await connection.query(
      `
      INSERT INTO webinar_cloudfront_log_objects (
        source_bucket,
        source_key,
        source_key_hash,
        source_etag,
        source_size_bytes,
        source_last_modified,
        status,
        attempts,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 'processing', 1, NOW(), NOW())
      `,
      [
        bucket,
        key,
        keyHash,
        etag,
        nonNegativeInt(size),
        lastModified || null,
      ]
    );

    await connection.commit();

    return {
      claimed: true,
      processed: false,
      row: {
        id: Number(result.insertId),
        source_bucket: bucket,
        source_key: key,
      },
      keyHash,
    };
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}

    throw error;
  } finally {
    connection.release();
  }
}

async function markProcessed(id, summary) {
  await pool.query(
    `
    UPDATE webinar_cloudfront_log_objects
    SET
      status = 'processed',
      records_total = ?,
      total_sc_bytes = ?,
      hls_records = ?,
      hls_sc_bytes = ?,
      attributed_bytes = ?,
      unattributed_hls_bytes = ?,
      processed_at = NOW(),
      error_message = NULL,
      updated_at = NOW()
    WHERE id = ?
    `,
    [
      nonNegativeInt(summary.recordsTotal),
      nonNegativeInt(summary.totalScBytes),
      nonNegativeInt(summary.hlsRecords),
      nonNegativeInt(summary.hlsScBytes),
      nonNegativeInt(summary.attributedBytes),
      nonNegativeInt(summary.unattributedHlsBytes),
      id,
    ]
  );
}

async function markFailed(id, error) {
  await pool.query(
    `
    UPDATE webinar_cloudfront_log_objects
    SET
      status = 'failed',
      error_message = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [
      String(error?.message || error || 'Unknown error').slice(0, 5000),
      id,
    ]
  );
}

async function attributeSummary({
  bucket,
  key,
  keyHash,
  summary,
}) {
  const ownership = await loadOwnership(summary.aggregates);
  let attributedBytes = 0;
  let unattributedHlsBytes = 0;

  for (const aggregate of summary.aggregates) {
    const owner = ownership.get(aggregate.mediaJobId);

    if (
      !owner ||
      owner.webinarId !== aggregate.webinarId
    ) {
      unattributedHlsBytes += aggregate.bytes;
      continue;
    }

    const usageKey =
      `cloudfront-log:${keyHash.slice(0, 32)}:` +
      `w${owner.webinarId}:m${owner.mediaJobId}`;

    try {
      await recordWebinarUsage({
        writerUserId: owner.writerUserId,
        usageKey,
        eventType: 'bandwidth',
        bandwidthBytes: aggregate.bytes,
        metadata: {
          source: 'cloudfront_standard_log',
          source_bucket: bucket,
          source_key_hash: keyHash,
          webinar_id: owner.webinarId,
          media_job_id: owner.mediaJobId,
          request_records: aggregate.records,
        },
      });

      attributedBytes += aggregate.bytes;
    } catch (error) {
      if (error?.code === 'WEBINAR_SUBSCRIPTION_REQUIRED') {
        unattributedHlsBytes += aggregate.bytes;
        continue;
      }

      throw error;
    }
  }

  return {
    attributedBytes,
    unattributedHlsBytes,
  };
}

async function processLogObject(object, config) {
  const claim = await claimLogObject({
    bucket: config.bucket,
    key: object.Key,
    etag: object.ETag || null,
    size: object.Size || 0,
    lastModified: object.LastModified || null,
  });

  if (!claim.claimed) {
    return {
      processed: false,
      skipped: true,
      alreadyProcessed: claim.processed,
      key: object.Key,
    };
  }

  try {
    const response = await getS3Client().send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: object.Key,
      })
    );

    const raw = await bodyToBuffer(response.Body);
    const text = decodeLogObject(
      raw,
      object.Key,
      response.ContentEncoding
    );
    const records = parseCloudFrontW3c(text);
    const summary = summarizeRecords(records);
    const attribution = await attributeSummary({
      bucket: config.bucket,
      key: object.Key,
      keyHash: claim.keyHash,
      summary,
    });

    await markProcessed(claim.row.id, {
      ...summary,
      ...attribution,
    });

    return {
      processed: true,
      skipped: false,
      key: object.Key,
      recordsTotal: summary.recordsTotal,
      totalScBytes: summary.totalScBytes,
      hlsRecords: summary.hlsRecords,
      hlsScBytes: summary.hlsScBytes,
      attributedBytes: attribution.attributedBytes,
      unattributedHlsBytes:
        attribution.unattributedHlsBytes,
    };
  } catch (error) {
    await markFailed(claim.row.id, error);
    throw error;
  }
}

async function listCandidateObjects(config) {
  const output = [];
  let continuationToken = undefined;

  for (
    let page = 0;
    page < config.scanPages && output.length < config.batchSize;
    page += 1
  ) {
    const response = await getS3Client().send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: config.prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    );

    const items = Array.isArray(response.Contents)
      ? response.Contents
      : [];

    items
      .filter((item) => item?.Key)
      .sort(
        (a, b) =>
          new Date(a.LastModified || 0).getTime() -
          new Date(b.LastModified || 0).getTime()
      );

    for (const item of items) {
      if (output.length >= config.batchSize) break;
      output.push(item);
    }

    if (!response.IsTruncated || !response.NextContinuationToken) {
      break;
    }

    continuationToken = response.NextContinuationToken;
  }

  return output;
}

async function processCloudFrontDeliveryBatch() {
  const config = assertEnabledConfig();
  const objects = await listCandidateObjects(config);
  const results = [];

  for (const object of objects) {
    try {
      results.push(
        await processLogObject(object, config)
      );
    } catch (error) {
      results.push({
        processed: false,
        skipped: false,
        key: object.Key,
        error: String(error?.message || error),
      });
    }
  }

  return {
    scanned: objects.length,
    processed: results.filter((item) => item.processed).length,
    skipped: results.filter((item) => item.skipped).length,
    failed: results.filter((item) => item.error).length,
    results,
  };
}

module.exports = {
  deliveryConfig,
  sourceKeyHash,
  extractWebinarHlsIdentity,
  parseCloudFrontW3c,
  summarizeRecords,
  decodeLogObject,
  processCloudFrontDeliveryBatch,
};