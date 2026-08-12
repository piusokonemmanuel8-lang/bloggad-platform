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

function sanitizeDomainRule(row) {
  if (!row) return null;

  return {
    id: row.id,
    domain: row.domain,
    rule_status: row.rule_status,
    category: row.category,
    reason: row.reason,
    applies_to_subdomains: !!row.applies_to_subdomains,
    is_active: !!row.is_active,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeDomainInput(value) {
  const raw = String(value || '').trim().toLowerCase();

  if (!raw) return '';

  try {
    const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
    return String(parsed.hostname || '').toLowerCase().replace(/\.$/, '');
  } catch (error) {
    return '';
  }
}

async function getDomainRules(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM outbound_domain_rules
      ORDER BY is_active DESC, rule_status ASC, domain ASC
      `
    );

    return res.status(200).json({
      ok: true,
      rules: rows.map(sanitizeDomainRule),
    });
  } catch (error) {
    console.error('getDomainRules error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to fetch domain rules', error: error.message });
  }
}

async function createDomainRule(req, res) {
  try {
    const domain = normalizeDomainInput(req.body?.domain);
    const ruleStatus = ['allow', 'block', 'review'].includes(req.body?.rule_status)
      ? req.body.rule_status
      : 'review';
    const category = String(req.body?.category || '').trim().slice(0, 80) || null;
    const reason = String(req.body?.reason || '').trim().slice(0, 500) || null;
    const appliesToSubdomains = req.body?.applies_to_subdomains === false ? 0 : 1;
    const isActive = req.body?.is_active === false ? 0 : 1;

    if (!domain) {
      return res.status(400).json({ ok: false, message: 'Valid domain is required' });
    }

    const [result] = await pool.query(
      `
      INSERT INTO outbound_domain_rules
      (domain, rule_status, category, reason, applies_to_subdomains, is_active, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [domain, ruleStatus, category, reason, appliesToSubdomains, isActive, req.user?.id || null]
    );

    const [rows] = await pool.query('SELECT * FROM outbound_domain_rules WHERE id = ? LIMIT 1', [result.insertId]);
    return res.status(201).json({ ok: true, rule: sanitizeDomainRule(rows[0]) });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, message: 'A rule already exists for this domain' });
    }
    console.error('createDomainRule error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to create domain rule', error: error.message });
  }
}

async function updateDomainRule(req, res) {
  try {
    const ruleId = Number(req.params.ruleId);

    if (!Number.isInteger(ruleId) || ruleId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid domain rule id' });
    }

    const [existingRows] = await pool.query('SELECT * FROM outbound_domain_rules WHERE id = ? LIMIT 1', [ruleId]);
    const existing = existingRows[0];

    if (!existing) {
      return res.status(404).json({ ok: false, message: 'Domain rule not found' });
    }

    const domain = req.body?.domain !== undefined ? normalizeDomainInput(req.body.domain) : existing.domain;
    const ruleStatus = req.body?.rule_status !== undefined
      ? (['allow', 'block', 'review'].includes(req.body.rule_status) ? req.body.rule_status : null)
      : existing.rule_status;

    if (!domain || !ruleStatus) {
      return res.status(400).json({ ok: false, message: 'Valid domain and rule status are required' });
    }

    const category = req.body?.category !== undefined
      ? (String(req.body.category || '').trim().slice(0, 80) || null)
      : existing.category;
    const reason = req.body?.reason !== undefined
      ? (String(req.body.reason || '').trim().slice(0, 500) || null)
      : existing.reason;
    const appliesToSubdomains = req.body?.applies_to_subdomains !== undefined
      ? (req.body.applies_to_subdomains ? 1 : 0)
      : Number(existing.applies_to_subdomains);
    const isActive = req.body?.is_active !== undefined
      ? (req.body.is_active ? 1 : 0)
      : Number(existing.is_active);

    await pool.query(
      `
      UPDATE outbound_domain_rules
      SET domain = ?, rule_status = ?, category = ?, reason = ?, applies_to_subdomains = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [domain, ruleStatus, category, reason, appliesToSubdomains, isActive, ruleId]
    );

    const [rows] = await pool.query('SELECT * FROM outbound_domain_rules WHERE id = ? LIMIT 1', [ruleId]);
    return res.status(200).json({ ok: true, rule: sanitizeDomainRule(rows[0]) });
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, message: 'A rule already exists for this domain' });
    }
    console.error('updateDomainRule error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to update domain rule', error: error.message });
  }
}

async function deleteDomainRule(req, res) {
  try {
    const ruleId = Number(req.params.ruleId);

    if (!Number.isInteger(ruleId) || ruleId <= 0) {
      return res.status(400).json({ ok: false, message: 'Invalid domain rule id' });
    }

    const [result] = await pool.query('DELETE FROM outbound_domain_rules WHERE id = ?', [ruleId]);

    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: 'Domain rule not found' });
    }

    return res.status(200).json({ ok: true, message: 'Domain rule deleted successfully' });
  } catch (error) {
    console.error('deleteDomainRule error:', error);
    return res.status(500).json({ ok: false, message: 'Failed to delete domain rule', error: error.message });
  }
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
  getDomainRules,
  createDomainRule,
  updateDomainRule,
  deleteDomainRule,
  getAllValidationLogs,
  getFailedValidationLogs,
  getPassedValidationLogs,
  getValidationLogSummary,
  getSingleValidationLog,
  deleteValidationLog,
  clearAllValidationLogs,
};