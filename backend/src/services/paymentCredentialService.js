const crypto = require('crypto');

const PREFIX = 'v1';

function masterKey() {
  const raw = String(process.env.BLOGGAD_PAYMENT_CREDENTIALS_KEY || '').trim();

  if (raw.length < 32) {
    throw new Error(
      'BLOGGAD_PAYMENT_CREDENTIALS_KEY must be configured before payment credentials can be used.'
    );
  }

  return crypto.createHash('sha256').update(raw, 'utf8').digest();
}

function encryptCredential(value) {
  const plain = String(value || '').trim();
  if (!plain) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString('base64'),
    tag.toString('base64'),
    encrypted.toString('base64'),
  ].join(':');
}

function decryptCredential(value) {
  const stored = String(value || '').trim();
  if (!stored) return '';

  const parts = stored.split(':');
  if (parts.length !== 4 || parts[0] !== PREFIX) {
    throw new Error('Unsupported encrypted payment credential format.');
  }

  const iv = Buffer.from(parts[1], 'base64');
  const tag = Buffer.from(parts[2], 'base64');
  const encrypted = Buffer.from(parts[3], 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey(), iv);

  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8');
}

module.exports = {
  encryptCredential,
  decryptCredential,
};
