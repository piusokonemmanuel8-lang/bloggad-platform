const pool = require('../../config/db');

function positiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function cleanText(value, maxLength = 2000) {
  return String(value || '').trim().slice(0, maxLength);
}

async function listPostReports(req, res) {
  try {
    const status = String(req.query?.status || '').trim().toLowerCase();
    const allowed = new Set(['pending', 'reviewed', 'dismissed', 'actioned']);
    const params = [];
    let where = '';

    if (status && allowed.has(status)) {
      where = 'WHERE pr.status = ?';
      params.push(status);
    }

    const [rows] = await pool.query(
      `
      SELECT
        pr.id,
        pr.post_id,
        pr.reporter_user_id,
        pr.reason,
        pr.details,
        pr.status,
        pr.admin_note,
        pr.reviewed_by_user_id,
        pr.reviewed_at,
        pr.created_at,
        pr.updated_at,
        pp.title AS post_title,
        pp.slug AS post_slug,
        aw.slug AS website_slug,
        reporter.name AS reporter_name,
        reviewer.name AS reviewer_name
      FROM post_reports pr
      INNER JOIN product_posts pp
        ON pp.id = pr.post_id
      LEFT JOIN affiliate_websites aw ON aw.id = pp.website_id
      INNER JOIN users reporter
        ON reporter.id = pr.reporter_user_id
      LEFT JOIN users reviewer
        ON reviewer.id = pr.reviewed_by_user_id
      ${where}
      ORDER BY
        CASE pr.status WHEN 'pending' THEN 0 ELSE 1 END ASC,
        pr.created_at DESC,
        pr.id DESC
      LIMIT 1000
      `,
      params
    );

    return res.status(200).json({ ok: true, reports: rows });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Failed to load story reports.',
      error: error.message,
    });
  }
}

async function updatePostReport(req, res) {
  try {
    const reportId = positiveInt(req.params.reportId);
    const status = String(req.body?.status || '').trim().toLowerCase();
    const adminNote = cleanText(req.body?.admin_note, 2000) || null;
    const allowed = new Set(['pending', 'reviewed', 'dismissed', 'actioned']);

    if (!reportId || !allowed.has(status)) {
      return res.status(400).json({
        ok: false,
        message: 'Valid report ID and status are required.',
      });
    }

    const reviewed = status === 'pending' ? null : new Date();

    const [result] = await pool.query(
      `
      UPDATE post_reports
      SET
        status = ?,
        admin_note = ?,
        reviewed_by_user_id = ?,
        reviewed_at = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        status,
        adminNote,
        status === 'pending' ? null : req.user.id,
        reviewed,
        reportId,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: 'Story report not found.' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM post_reports WHERE id = ? LIMIT 1`,
      [reportId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Story report updated.',
      report: rows[0] || null,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Failed to update story report.',
      error: error.message,
    });
  }
}

module.exports = {
  listPostReports,
  updatePostReport,
};