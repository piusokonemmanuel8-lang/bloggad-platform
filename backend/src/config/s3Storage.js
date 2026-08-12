const { Transform } = require('stream');
const {
  S3Client,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

let client;

function getBucketName() {
  const bucket = String(process.env.AWS_S3_BUCKET || '').trim();

  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }

  return bucket;
}

function getRegion() {
  const region = String(process.env.AWS_REGION || '').trim();

  if (!region) {
    throw new Error('AWS_REGION is not configured');
  }

  return region;
}

function getS3Client() {
  if (!client) {
    client = new S3Client({
      region: getRegion(),
    });
  }

  return client;
}

function normalizePrefix(prefix) {
  return String(prefix || '')
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');
}

function buildObjectKey(prefix, filename) {
  const cleanPrefix = normalizePrefix(prefix);
  return cleanPrefix ? `${cleanPrefix}/${filename}` : filename;
}

class S3MulterStorage {
  constructor(options = {}) {
    this.prefix = normalizePrefix(options.prefix || 'template-images');
    this.filenameBuilder = options.filenameBuilder;
  }

  _handleFile(req, file, cb) {
    let filename;

    try {
      if (typeof this.filenameBuilder !== 'function') {
        throw new Error('S3 upload filename builder is not configured');
      }

      filename = this.filenameBuilder(file.originalname);
    } catch (error) {
      cb(error);
      return;
    }

    const bucket = getBucketName();
    const key = buildObjectKey(this.prefix, filename);
    let size = 0;

    const counter = new Transform({
      transform(chunk, encoding, callback) {
        size += chunk.length;
        callback(null, chunk);
      },
    });

    file.stream.pipe(counter);

    const upload = new Upload({
      client: getS3Client(),
      params: {
        Bucket: bucket,
        Key: key,
        Body: counter,
        ContentType: file.mimetype || 'application/octet-stream',
        CacheControl: 'public, max-age=31536000, immutable',
      },
      queueSize: 3,
      partSize: 8 * 1024 * 1024,
      leavePartsOnError: false,
    });

    upload
      .done()
      .then((result) => {
        cb(null, {
          filename,
          key,
          bucket,
          size,
          etag: result && result.ETag ? result.ETag : null,
        });
      })
      .catch((error) => {
        cb(error);
      });
  }

  _removeFile(req, file, cb) {
    if (!file || !file.key) {
      cb(null);
      return;
    }

    getS3Client()
      .send(
        new DeleteObjectCommand({
          Bucket: file.bucket || getBucketName(),
          Key: file.key,
        })
      )
      .then(() => cb(null))
      .catch((error) => cb(error));
  }
}

function createS3MulterStorage(options = {}) {
  return new S3MulterStorage(options);
}

function parseRange(rangeHeader, totalSize) {
  if (!rangeHeader || !Number.isFinite(totalSize) || totalSize <= 0) {
    return null;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(String(rangeHeader).trim());

  if (!match) {
    return null;
  }

  let start;
  let end;

  if (match[1] === '' && match[2] !== '') {
    const suffixLength = Number(match[2]);

    if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
      return null;
    }

    start = Math.max(totalSize - suffixLength, 0);
    end = totalSize - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === '' ? totalSize - 1 : Number(match[2]);
  }

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    start >= totalSize
  ) {
    return null;
  }

  end = Math.min(end, totalSize - 1);

  return {
    start,
    end,
  };
}

function isMissingObjectError(error) {
  if (!error) return false;

  const statusCode = error.$metadata && error.$metadata.httpStatusCode;

  return (
    statusCode === 404 ||
    error.name === 'NoSuchKey' ||
    error.name === 'NotFound'
  );
}

async function serveS3TemplateImage(req, res, next) {
  const filename = String(req.params.filename || '').trim();

  if (
    !filename ||
    filename !== filename.replace(/[\\/]/g, '') ||
    !/^[a-zA-Z0-9._-]+$/.test(filename)
  ) {
    return next();
  }

  const bucket = getBucketName();
  const key = buildObjectKey('template-images', filename);
  const s3 = getS3Client();

  try {
    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    const totalSize = Number(head.ContentLength || 0);
    const range = parseRange(req.headers.range, totalSize);

    if (req.headers.range && !range) {
      res.status(416);

      if (totalSize > 0) {
        res.setHeader('Content-Range', `bytes */${totalSize}`);
      }

      return res.end();
    }

    const commandInput = {
      Bucket: bucket,
      Key: key,
    };

    if (range) {
      commandInput.Range = `bytes=${range.start}-${range.end}`;
    }

    const object = await s3.send(new GetObjectCommand(commandInput));

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader(
      'Cache-Control',
      object.CacheControl || 'public, max-age=31536000, immutable'
    );

    if (object.ContentType) {
      res.setHeader('Content-Type', object.ContentType);
    }

    if (object.ETag) {
      res.setHeader('ETag', object.ETag);
    }

    if (range) {
      const length = range.end - range.start + 1;
      res.status(206);
      res.setHeader('Content-Length', String(length));
      res.setHeader(
        'Content-Range',
        `bytes ${range.start}-${range.end}/${totalSize}`
      );
    } else if (Number.isFinite(totalSize) && totalSize >= 0) {
      res.setHeader('Content-Length', String(totalSize));
    }

    object.Body.on('error', next);
    object.Body.pipe(res);
    return undefined;
  } catch (error) {
    if (isMissingObjectError(error)) {
      return next();
    }

    return next(error);
  }
}

module.exports = {
  createS3MulterStorage,
  getBucketName,
  getRegion,
  getS3Client,
  serveS3TemplateImage,
};