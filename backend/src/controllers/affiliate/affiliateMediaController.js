const pool = require('../../config/db');

function sanitizeMedia(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    website_id: row.website_id,
    file_name: row.file_name,
    file_path: row.file_path,
    file_type: row.file_type,
    mime_type: row.mime_type,
    file_size: row.file_size !== null ? Number(row.file_size) : null,
    alt_text: row.alt_text,
    title: row.title,
    source_type: row.source_type,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str ? str : null;
}

function normalizeFileSize(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num);
}

async function getAffiliateWebsite(userId) {
  const [rows] = await pool.query(
    `
    SELECT id, user_id, website_name, slug, status
    FROM affiliate_websites
    WHERE user_id = ?
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getMediaById(mediaId, userId) {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      user_id,
      website_id,
      file_name,
      file_path,
      file_type,
      mime_type,
      file_size,
      alt_text,
      title,
      source_type,
      created_at,
      updated_at
    FROM media_library
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
    `,
    [mediaId, userId]
  );

  return rows[0] || null;
}

async function getMyMediaLibrary(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        user_id,
        website_id,
        file_name,
        file_path,
        file_type,
        mime_type,
        file_size,
        alt_text,
        title,
        source_type,
        created_at,
        updated_at
      FROM media_library
      WHERE user_id = ?
      ORDER BY id DESC
      `,
      [req.user.id]
    );

    return res.status(200).json({
      ok: true,
      media: rows.map(sanitizeMedia),
    });
  } catch (error) {
    console.error('getMyMediaLibrary error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch media library',
      error: error.message,
    });
  }
}

async function getMyMediaById(req, res) {
  try {
    const mediaId = Number(req.params.id);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid media id',
      });
    }

    const media = await getMediaById(mediaId, req.user.id);

    if (!media) {
      return res.status(404).json({
        ok: false,
        message: 'Media not found',
      });
    }

    return res.status(200).json({
      ok: true,
      media: sanitizeMedia(media),
    });
  } catch (error) {
    console.error('getMyMediaById error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch media',
      error: error.message,
    });
  }
}

async function createMedia(req, res) {
  try {
    const {
      website_id,
      file_name,
      file_path,
      file_type,
      mime_type,
      file_size,
      alt_text,
      title,
      source_type,
    } = req.body;

    if (!file_name || !String(file_name).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'File name is required',
      });
    }

    if (!file_path || !String(file_path).trim()) {
      return res.status(400).json({
        ok: false,
        message: 'File path is required',
      });
    }

    let cleanWebsiteId = null;

    if (website_id !== undefined && website_id !== null && website_id !== '') {
      cleanWebsiteId = Number(website_id);

      if (!Number.isInteger(cleanWebsiteId) || cleanWebsiteId <= 0) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid website id',
        });
      }

      const website = await getAffiliateWebsite(req.user.id);

      if (!website || website.id !== cleanWebsiteId) {
        return res.status(400).json({
          ok: false,
          message: 'You can only attach media to your own website',
        });
      }
    } else {
      const website = await getAffiliateWebsite(req.user.id);
      cleanWebsiteId = website ? website.id : null;
    }

    const cleanSourceType = [
      'logo',
      'banner',
      'slider',
      'product',
      'post',
      'template',
      'general',
    ].includes(source_type)
      ? source_type
      : 'general';

    const [result] = await pool.query(
      `
      INSERT INTO media_library
      (
        user_id,
        website_id,
        file_name,
        file_path,
        file_type,
        mime_type,
        file_size,
        alt_text,
        title,
        source_type,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        req.user.id,
        cleanWebsiteId,
        String(file_name).trim(),
        String(file_path).trim(),
        normalizeNullable(file_type),
        normalizeNullable(mime_type),
        normalizeFileSize(file_size),
        normalizeNullable(alt_text),
        normalizeNullable(title),
        cleanSourceType,
      ]
    );

    const createdMedia = await getMediaById(result.insertId, req.user.id);

    return res.status(201).json({
      ok: true,
      message: 'Media created successfully',
      media: sanitizeMedia(createdMedia),
    });
  } catch (error) {
    console.error('createMedia error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to create media',
      error: error.message,
    });
  }
}

async function updateMedia(req, res) {
  try {
    const mediaId = Number(req.params.id);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid media id',
      });
    }

    const existingMedia = await getMediaById(mediaId, req.user.id);

    if (!existingMedia) {
      return res.status(404).json({
        ok: false,
        message: 'Media not found',
      });
    }

    const {
      file_name,
      file_path,
      file_type,
      mime_type,
      file_size,
      alt_text,
      title,
      source_type,
    } = req.body;

    const cleanFileName =
      file_name !== undefined ? String(file_name).trim() : existingMedia.file_name;

    const cleanFilePath =
      file_path !== undefined ? String(file_path).trim() : existingMedia.file_path;

    if (!cleanFileName) {
      return res.status(400).json({
        ok: false,
        message: 'File name is required',
      });
    }

    if (!cleanFilePath) {
      return res.status(400).json({
        ok: false,
        message: 'File path is required',
      });
    }

    const cleanSourceType = [
      'logo',
      'banner',
      'slider',
      'product',
      'post',
      'template',
      'general',
    ].includes(source_type)
      ? source_type
      : existingMedia.source_type;

    await pool.query(
      `
      UPDATE media_library
      SET
        file_name = ?,
        file_path = ?,
        file_type = ?,
        mime_type = ?,
        file_size = ?,
        alt_text = ?,
        title = ?,
        source_type = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        cleanFileName,
        cleanFilePath,
        file_type !== undefined ? normalizeNullable(file_type) : existingMedia.file_type,
        mime_type !== undefined ? normalizeNullable(mime_type) : existingMedia.mime_type,
        file_size !== undefined ? normalizeFileSize(file_size) : existingMedia.file_size,
        alt_text !== undefined ? normalizeNullable(alt_text) : existingMedia.alt_text,
        title !== undefined ? normalizeNullable(title) : existingMedia.title,
        cleanSourceType,
        mediaId,
        req.user.id,
      ]
    );

    const updatedMedia = await getMediaById(mediaId, req.user.id);

    return res.status(200).json({
      ok: true,
      message: 'Media updated successfully',
      media: sanitizeMedia(updatedMedia),
    });
  } catch (error) {
    console.error('updateMedia error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to update media',
      error: error.message,
    });
  }
}

async function deleteMedia(req, res) {
  try {
    const mediaId = Number(req.params.id);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid media id',
      });
    }

    const existingMedia = await getMediaById(mediaId, req.user.id);

    if (!existingMedia) {
      return res.status(404).json({
        ok: false,
        message: 'Media not found',
      });
    }

    await pool.query(
      `
      DELETE FROM media_library
      WHERE id = ?
        AND user_id = ?
      `,
      [mediaId, req.user.id]
    );

    return res.status(200).json({
      ok: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('deleteMedia error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete media',
      error: error.message,
    });
  }
}

module.exports = {
  getMyMediaLibrary,
  getMyMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
};