const pool = require('../../config/db');

function sanitizeValidationLog(row) {
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    website_id: row.website_id,
    source_type: row.source_type,
    source_id: row.source_id,
    submitted_link: row.submitted_link,
    detected_host: row.detected_host,
    is_allowed: !!row.is_allowed,
    failure_reason: row.failure_reason,
    created_at: row.created_at,
    affiliate: row.user_id
      ? {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          status: row.user_status,
        }
      : null,
    website: row.website_id
      ? {
          id: row.website_id,
          website_name: row.website_name,
          slug: row.website_slug,
          status: row.website_status,
        }
      : null,
  };
}

async function getValidationLogById(logId) {
  const [rows] = await pool.query(
    `
    SELECT
      lvl.id,
      lvl.user_id,
      lvl.website_id,
      lvl.source_type,
      lvl.source_id,
      lvl.submitted_link,
      lvl.detected_host,
      lvl.is_allowed,
      lvl.failure_reason,
      lvl.created_at,

      u.name AS user_name,
      u.email AS user_email,
      u.status AS user_status,

      aw.website_name,
      aw.slug AS website_slug,
      aw.status AS website_status

    FROM link_validation_logs lvl
    LEFT JOIN users u
      ON u.id = lvl.user_id
    LEFT JOIN affiliate_websites aw
      ON aw.id = lvl.website_id
    WHERE lvl.id = ?
    LIMIT 1
    `,
    [logId]
  );

  return rows[0] || null;
}

async function getAllValidationLogs(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        lvl.id,
        lvl.user_id,
        lvl.website_id,
        lvl.source_type,
        lvl.source_id,
        lvl.submitted_link,
        lvl.detected_host,
        lvl.is_allowed,
        lvl.failure_reason,
        lvl.created_at,

        u.name AS user_name,
        u.email AS user_email,
        u.status AS user_status,

        aw.website_name,
        aw.slug AS website_slug,
        aw.status AS website_status

      FROM link_validation_logs lvl
      LEFT JOIN users u
        ON u.id = lvl.user_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = lvl.website_id
      ORDER BY lvl.id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      logs: rows.map(sanitizeValidationLog),
    });
  } catch (error) {
    console.error('getAllValidationLogs error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch link validation logs',
      error: error.message,
    });
  }
}

async function getFailedValidationLogs(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        lvl.id,
        lvl.user_id,
        lvl.website_id,
        lvl.source_type,
        lvl.source_id,
        lvl.submitted_link,
        lvl.detected_host,
        lvl.is_allowed,
        lvl.failure_reason,
        lvl.created_at,

        u.name AS user_name,
        u.email AS user_email,
        u.status AS user_status,

        aw.website_name,
        aw.slug AS website_slug,
        aw.status AS website_status

      FROM link_validation_logs lvl
      LEFT JOIN users u
        ON u.id = lvl.user_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = lvl.website_id
      WHERE lvl.is_allowed = 0
      ORDER BY lvl.id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      logs: rows.map(sanitizeValidationLog),
    });
  } catch (error) {
    console.error('getFailedValidationLogs error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch failed validation logs',
      error: error.message,
    });
  }
}

async function getPassedValidationLogs(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        lvl.id,
        lvl.user_id,
        lvl.website_id,
        lvl.source_type,
        lvl.source_id,
        lvl.submitted_link,
        lvl.detected_host,
        lvl.is_allowed,
        lvl.failure_reason,
        lvl.created_at,

        u.name AS user_name,
        u.email AS user_email,
        u.status AS user_status,

        aw.website_name,
        aw.slug AS website_slug,
        aw.status AS website_status

      FROM link_validation_logs lvl
      LEFT JOIN users u
        ON u.id = lvl.user_id
      LEFT JOIN affiliate_websites aw
        ON aw.id = lvl.website_id
      WHERE lvl.is_allowed = 1
      ORDER BY lvl.id DESC
      `
    );

    return res.status(200).json({
      ok: true,
      logs: rows.map(sanitizeValidationLog),
    });
  } catch (error) {
    console.error('getPassedValidationLogs error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch passed validation logs',
      error: error.message,
    });
  }
}

async function getValidationLogSummary(req, res) {
  try {
    const [summaryRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_logs,
        SUM(CASE WHEN is_allowed = 1 THEN 1 ELSE 0 END) AS passed_logs,
        SUM(CASE WHEN is_allowed = 0 THEN 1 ELSE 0 END) AS failed_logs
      FROM link_validation_logs
      `
    );

    const [sourceRows] = await pool.query(
      `
      SELECT
        source_type,
        COUNT(*) AS total_logs,
        SUM(CASE WHEN is_allowed = 1 THEN 1 ELSE 0 END) AS passed_logs,
        SUM(CASE WHEN is_allowed = 0 THEN 1 ELSE 0 END) AS failed_logs
      FROM link_validation_logs
      GROUP BY source_type
      ORDER BY source_type ASC
      `
    );

    const [hostRows] = await pool.query(
      `
      SELECT
        COALESCE(detected_host, 'unknown') AS detected_host,
        COUNT(*) AS total_logs
      FROM link_validation_logs
      GROUP BY detected_host
      ORDER BY total_logs DESC, detected_host ASC
      `
    );

    return res.status(200).json({
      ok: true,
      summary: {
        total_logs: Number(summaryRows[0]?.total_logs || 0),
        passed_logs: Number(summaryRows[0]?.passed_logs || 0),
        failed_logs: Number(summaryRows[0]?.failed_logs || 0),
        by_source_type: sourceRows.map((row) => ({
          source_type: row.source_type,
          total_logs: Number(row.total_logs || 0),
          passed_logs: Number(row.passed_logs || 0),
          failed_logs: Number(row.failed_logs || 0),
        })),
        by_detected_host: hostRows.map((row) => ({
          detected_host: row.detected_host,
          total_logs: Number(row.total_logs || 0),
        })),
      },
    });
  } catch (error) {
    console.error('getValidationLogSummary error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch validation summary',
      error: error.message,
    });
  }
}

async function getSingleValidationLog(req, res) {
  try {
    const logId = Number(req.params.id);

    if (!Number.isInteger(logId) || logId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid validation log id',
      });
    }

    const log = await getValidationLogById(logId);

    if (!log) {
      return res.status(404).json({
        ok: false,
        message: 'Validation log not found',
      });
    }

    return res.status(200).json({
      ok: true,
      log: sanitizeValidationLog(log),
    });
  } catch (error) {
    console.error('getSingleValidationLog error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch validation log',
      error: error.message,
    });
  }
}

async function deleteValidationLog(req, res) {
  try {
    const logId = Number(req.params.id);

    if (!Number.isInteger(logId) || logId <= 0) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid validation log id',
      });
    }

    const existingLog = await getValidationLogById(logId);

    if (!existingLog) {
      return res.status(404).json({
        ok: false,
        message: 'Validation log not found',
      });
    }

    await pool.query(
      `
      DELETE FROM link_validation_logs
      WHERE id = ?
      `,
      [logId]
    );

    return res.status(200).json({
      ok: true,
      message: 'Validation log deleted successfully',
    });
  } catch (error) {
    console.error('deleteValidationLog error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to delete validation log',
      error: error.message,
    });
  }
}

async function clearAllValidationLogs(req, res) {
  try {
    await pool.query(`DELETE FROM link_validation_logs`);

    return res.status(200).json({
      ok: true,
      message: 'All validation logs cleared successfully',
    });
  } catch (error) {
    console.error('clearAllValidationLogs error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to clear validation logs',
      error: error.message,
    });
  }
}

module.exports = {
  getAllValidationLogs,
  getFailedValidationLogs,
  getPassedValidationLogs,
  getValidationLogSummary,
  getSingleValidationLog,
  deleteValidationLog,
  clearAllValidationLogs,
};