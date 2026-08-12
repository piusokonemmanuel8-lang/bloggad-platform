const fs = require('fs');
const path = require('path');

const BACKEND_ROOT = path.resolve(__dirname, '..', '..');

function isPathInside(parentPath, childPath) {
  const parent = path.resolve(parentPath);
  const child = path.resolve(childPath);
  const relative = path.relative(parent, child);

  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  return dirPath;
}

function resolveUploadsRoot() {
  const configured = String(process.env.BLOGGAD_UPLOADS_ROOT || '').trim();
  const nodeEnv = String(process.env.NODE_ENV || 'development').trim().toLowerCase();

  if (!configured) {
    if (nodeEnv === 'production') {
      throw new Error(
        'BLOGGAD_UPLOADS_ROOT is required in production and must point to persistent storage outside the deployed backend directory.'
      );
    }

    return path.join(BACKEND_ROOT, 'uploads');
  }

  const resolved = path.resolve(configured);

  if (nodeEnv === 'production' && isPathInside(BACKEND_ROOT, resolved)) {
    throw new Error(
      'BLOGGAD_UPLOADS_ROOT must be outside the deployed backend directory in production.'
    );
  }

  return resolved;
}

function getUploadsRoot() {
  return ensureDirectory(resolveUploadsRoot());
}

function getUploadDir(...segments) {
  const root = getUploadsRoot();
  const target = path.resolve(root, ...segments);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Upload directory resolved outside BLOGGAD_UPLOADS_ROOT.');
  }

  return ensureDirectory(target);
}

function getLegacyUploadRoots() {
  const canonical = path.resolve(getUploadsRoot());

  const candidates = [
    path.join(BACKEND_ROOT, 'uploads'),
    path.join(process.cwd(), 'uploads'),
    path.join(BACKEND_ROOT, 'src', 'uploads'),
  ];

  const unique = [];

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);

    if (resolved === canonical) continue;
    if (unique.includes(resolved)) continue;

    unique.push(resolved);
  }

  return unique;
}

module.exports = {
  getUploadsRoot,
  getUploadDir,
  getLegacyUploadRoots,
};
