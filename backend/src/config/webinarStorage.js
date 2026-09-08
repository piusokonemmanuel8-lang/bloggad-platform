const { Transform } = require('stream');
const { Upload } = require('@aws-sdk/lib-storage');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getS3Client } = require('./s3Storage');

function cleanPart(value) {
  return String(value || '')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePrefix(prefix) {
  return String(prefix || '')
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');
}

function getWebinarBucketName() {
  const bucket = String(
    process.env.AWS_WEBINAR_S3_BUCKET || process.env.AWS_S3_BUCKET || ''
  ).trim();

  if (!bucket) {
    throw new Error(
      'AWS_WEBINAR_S3_BUCKET or AWS_S3_BUCKET must be configured'
    );
  }

  return bucket;
}

function createWebinarSourceStorage(options = {}) {
  const prefixBuilder =
    typeof options.prefixBuilder === 'function'
      ? options.prefixBuilder
      : () => 'webinars/source';

  const filenameBuilder =
    typeof options.filenameBuilder === 'function'
      ? options.filenameBuilder
      : (req, file) => cleanPart(file.originalname) || 'webinar-video.mp4';

  return {
    _handleFile(req, file, cb) {
      let bucket;
      let key;
      let s3;

      try {
        bucket = getWebinarBucketName();
        s3 = getS3Client();

        const prefix = normalizePrefix(prefixBuilder(req, file));
        const filename = cleanPart(filenameBuilder(req, file));

        if (!filename) {
          throw new Error('Webinar source filename could not be generated');
        }

        key = prefix ? `${prefix}/${filename}` : filename;
      } catch (error) {
        cb(error);
        return;
      }

      let size = 0;
      const counter = new Transform({
        transform(chunk, encoding, callback) {
          size += chunk.length;
          callback(null, chunk);
        },
      });

      file.stream.pipe(counter);

      const upload = new Upload({
        client: s3,
        params: {
          Bucket: bucket,
          Key: key,
          Body: counter,
          ContentType: file.mimetype || 'video/mp4',
          CacheControl: 'private, no-store',
        },
        queueSize: 4,
        partSize: 16 * 1024 * 1024,
        leavePartsOnError: false,
      });

      upload
        .done()
        .then((result) => {
          cb(null, {
            bucket,
            key,
            size,
            etag: result && result.ETag ? result.ETag : null,
            originalname: file.originalname,
            mimetype: file.mimetype,
          });
        })
        .catch(cb);
    },

    _removeFile(req, file, cb) {
      if (!file || !file.key) {
        cb(null);
        return;
      }

      getS3Client()
        .send(
          new DeleteObjectCommand({
            Bucket: file.bucket || getWebinarBucketName(),
            Key: file.key,
          })
        )
        .then(() => cb(null))
        .catch(cb);
    },
  };
}

module.exports = {
  cleanPart,
  getWebinarBucketName,
  createWebinarSourceStorage,
};
