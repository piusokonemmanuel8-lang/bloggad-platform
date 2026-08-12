const pool = require('../../config/db');

function cleanText(value, max = 255) {
  const text = String(value || '').trim();
  return text ? text.slice(0, max) : null;
}

function makeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 240);
}

async function getWebsiteForUser(userId) {
  const [rows] = await pool.query(
    `
    SELECT id, user_id
    FROM affiliate_websites
    WHERE user_id = ?
    ORDER BY id ASC
    LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function listWriterSeries(req, res) {
  try {
    const userId = req.user.id;
    const website = await getWebsiteForUser(userId);

    if (!website) {
      return res.status(200).json({ ok: true, series: [] });
    }

    const [rows] = await pool.query(
      `
      SELECT
        ws.id,
        ws.user_id,
        ws.website_id,
        ws.title,
        ws.slug,
        ws.description,
        ws.cover_image,
        ws.series_type,
        ws.status,
        ws.created_at,
        ws.updated_at,
        COUNT(wsi.id) AS total_items
      FROM writer_series ws
      LEFT JOIN writer_series_items wsi ON wsi.series_id = ws.id
      WHERE ws.user_id = ?
        AND ws.website_id = ?
      GROUP BY ws.id
      ORDER BY ws.updated_at DESC, ws.id DESC
      `,
      [userId, website.id]
    );

    return res.status(200).json({
      ok: true,
      series: rows.map((row) => ({
        ...row,
        total_items: Number(row.total_items || 0),
      })),
    });
  } catch (error) {
    console.error('listWriterSeries error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to load Writer series' });
  }
}

async function getWriterSeries(req, res) {
  try {
    const userId = req.user.id;
    const seriesId = Number(req.params.id);

    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid series id' });
    }

    const [seriesRows] = await pool.query(
      `
      SELECT *
      FROM writer_series
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
      `,
      [seriesId, userId]
    );

    const series = seriesRows[0] || null;

    if (!series) {
      return res.status(404).json({ ok: false, message: 'Series not found' });
    }

    const [items] = await pool.query(
      `
      SELECT
        wsi.id,
        wsi.series_id,
        wsi.post_id,
        wsi.season_number,
        wsi.episode_number,
        wsi.sort_order,
        pp.title,
        pp.slug,
        pp.content_type,
        pp.status,
        pp.scheduled_at,
        pp.published_at
      FROM writer_series_items wsi
      INNER JOIN product_posts pp ON pp.id = wsi.post_id
      WHERE wsi.series_id = ?
        AND pp.user_id = ?
      ORDER BY wsi.sort_order ASC, wsi.id ASC
      `,
      [seriesId, userId]
    );

    return res.status(200).json({ ok: true, series: { ...series, items } });
  } catch (error) {
    console.error('getWriterSeries error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to load Writer series' });
  }
}

async function createWriterSeries(req, res) {
  try {
    const userId = req.user.id;
    const website = await getWebsiteForUser(userId);

    if (!website) {
      return res.status(400).json({
        ok: false,
        message: 'Create your website first before creating a series',
      });
    }

    const title = cleanText(req.body.title);
    const seriesType = ['series', 'book', 'novel', 'course', 'collection'].includes(req.body.series_type)
      ? req.body.series_type
      : 'series';
    const status = ['draft', 'published', 'inactive'].includes(req.body.status)
      ? req.body.status
      : 'draft';

    if (!title) {
      return res.status(400).json({ ok: false, message: 'Series title is required' });
    }

    let slug = makeSlug(req.body.slug || title);
    if (!slug) {
      return res.status(400).json({ ok: false, message: 'A valid series slug is required' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM writer_series WHERE website_id = ? AND slug = ? LIMIT 1',
      [website.id, slug]
    );

    if (existing.length) {
      slug = `${slug}-${Date.now()}`;
    }

    const [result] = await pool.query(
      `
      INSERT INTO writer_series
      (
        user_id,
        website_id,
        title,
        slug,
        description,
        cover_image,
        series_type,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        userId,
        website.id,
        title,
        slug,
        cleanText(req.body.description, 5000),
        cleanText(req.body.cover_image, 255),
        seriesType,
        status,
      ]
    );

    return res.status(201).json({
      ok: true,
      message: 'Writer series created successfully',
      series_id: result.insertId,
    });
  } catch (error) {
    console.error('createWriterSeries error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to create Writer series' });
  }
}

async function updateWriterSeries(req, res) {
  try {
    const userId = req.user.id;
    const seriesId = Number(req.params.id);

    if (!Number.isInteger(seriesId) || seriesId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid series id' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM writer_series WHERE id = ? AND user_id = ? LIMIT 1',
      [seriesId, userId]
    );

    const existing = rows[0] || null;

    if (!existing) {
      return res.status(404).json({ ok: false, message: 'Series not found' });
    }

    const title = req.body.title !== undefined ? cleanText(req.body.title) : existing.title;
    const slug =
      req.body.slug !== undefined || req.body.title !== undefined
        ? makeSlug(req.body.slug || title)
        : existing.slug;
    const seriesType = ['series', 'book', 'novel', 'course', 'collection'].includes(req.body.series_type)
      ? req.body.series_type
      : existing.series_type;
    const status = ['draft', 'published', 'inactive'].includes(req.body.status)
      ? req.body.status
      : existing.status;

    if (!title || !slug) {
      return res.status(400).json({ ok: false, message: 'Series title and slug are required' });
    }

    await pool.query(
      `
      UPDATE writer_series
      SET
        title = ?,
        slug = ?,
        description = ?,
        cover_image = ?,
        series_type = ?,
        status = ?,
        updated_at = NOW()
      WHERE id = ?
        AND user_id = ?
      `,
      [
        title,
        slug,
        req.body.description !== undefined ? cleanText(req.body.description, 5000) : existing.description,
        req.body.cover_image !== undefined ? cleanText(req.body.cover_image, 255) : existing.cover_image,
        seriesType,
        status,
        seriesId,
        userId,
      ]
    );

    return res.status(200).json({ ok: true, message: 'Writer series updated successfully' });
  } catch (error) {
    console.error('updateWriterSeries error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update Writer series' });
  }
}

async function assignWriterSeriesItem(req, res) {
  try {
    const userId = req.user.id;
    const seriesId = Number(req.params.id);
    const postId = Number(req.body.post_id);

    if (!Number.isInteger(seriesId) || seriesId <= 0 || !Number.isInteger(postId) || postId <= 0) {
      return res.status(400).json({ ok: false, message: 'Valid series and post ids are required' });
    }

    const [seriesRows] = await pool.query(
      'SELECT id, website_id FROM writer_series WHERE id = ? AND user_id = ? LIMIT 1',
      [seriesId, userId]
    );

    const series = seriesRows[0] || null;

    if (!series) {
      return res.status(404).json({ ok: false, message: 'Series not found' });
    }

    const [postRows] = await pool.query(
      'SELECT id, website_id FROM product_posts WHERE id = ? AND user_id = ? LIMIT 1',
      [postId, userId]
    );

    const post = postRows[0] || null;

    if (!post || Number(post.website_id) !== Number(series.website_id)) {
      return res.status(404).json({ ok: false, message: 'Post not found for this Writer Space' });
    }

    const seasonNumber =
      req.body.season_number === null || req.body.season_number === ''
        ? null
        : Math.max(1, Number(req.body.season_number) || 1);
    const episodeNumber =
      req.body.episode_number === null || req.body.episode_number === ''
        ? null
        : Math.max(1, Number(req.body.episode_number) || 1);
    const sortOrder = Math.max(0, Number(req.body.sort_order) || 0);

    await pool.query(
      `
      INSERT INTO writer_series_items
      (
        series_id,
        post_id,
        season_number,
        episode_number,
        sort_order,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        series_id = VALUES(series_id),
        season_number = VALUES(season_number),
        episode_number = VALUES(episode_number),
        sort_order = VALUES(sort_order),
        updated_at = NOW()
      `,
      [seriesId, postId, seasonNumber, episodeNumber, sortOrder]
    );

    return res.status(200).json({ ok: true, message: 'Post assigned to Writer series' });
  } catch (error) {
    console.error('assignWriterSeriesItem error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to assign post to Writer series' });
  }
}

async function removeWriterSeriesItem(req, res) {
  try {
    const userId = req.user.id;
    const seriesId = Number(req.params.id);
    const postId = Number(req.params.postId);

    const [result] = await pool.query(
      `
      DELETE wsi
      FROM writer_series_items wsi
      INNER JOIN writer_series ws ON ws.id = wsi.series_id
      WHERE wsi.series_id = ?
        AND wsi.post_id = ?
        AND ws.user_id = ?
      `,
      [seriesId, postId, userId]
    );

    return res.status(200).json({
      ok: true,
      message: result.affectedRows ? 'Post removed from Writer series' : 'Series item was already absent',
    });
  } catch (error) {
    console.error('removeWriterSeriesItem error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to remove series item' });
  }
}

async function deleteWriterSeries(req, res) {
  try {
    const userId = req.user.id;
    const seriesId = Number(req.params.id);

    const [result] = await pool.query(
      'DELETE FROM writer_series WHERE id = ? AND user_id = ?',
      [seriesId, userId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: 'Series not found' });
    }

    return res.status(200).json({ ok: true, message: 'Writer series deleted successfully' });
  } catch (error) {
    console.error('deleteWriterSeries error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to delete Writer series' });
  }
}

module.exports = {
  listWriterSeries,
  getWriterSeries,
  createWriterSeries,
  updateWriterSeries,
  assignWriterSeriesItem,
  removeWriterSeriesItem,
  deleteWriterSeries,
};
