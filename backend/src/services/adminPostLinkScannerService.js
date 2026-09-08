const crypto = require('crypto');
const net = require('net');
const pool = require('../config/db');
const { getOutboundDomainRule, logLinkValidation } = require('./linkValidationService');
const { validateSupgadUrl } = require('../utils/validateSupgadUrl');

const SCAN_JOB_TTL_MS = 10 * 60 * 1000;
const scanJobs = new Map();

function normalizeIds(value) {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))).slice(0, 20);
}

function normalizeDomainInput(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return '';
  try {
    const parsed = new URL(raw.includes('://') ? raw : `https://${raw}`);
    return String(parsed.hostname || '').toLowerCase().replace(/\.$/, '');
  } catch {
    return '';
  }
}

function isPrivateOrLocalHost(hostname) {
  const host = String(hostname || '').trim().toLowerCase().replace(/\.$/, '');
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0') return true;

  const version = net.isIP(host);
  if (version === 4) {
    const parts = host.split('.').map(Number);
    const [a, b] = parts;
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }

  if (version === 6) {
    return host === '::1' || host === '::' || host.startsWith('fc') || host.startsWith('fd') ||
      host.startsWith('fe8') || host.startsWith('fe9') || host.startsWith('fea') || host.startsWith('feb');
  }

  return false;
}

function pushCandidate(output, value, meta = {}) {
  const raw = String(value || '').trim();
  if (!raw) return;
  output.push({
    url: raw,
    source_type: meta.source_type || 'post',
    source_id: meta.source_id || null,
    source_label: meta.source_label || null,
  });
}

function extractCandidatesFromString(value, output, meta = {}) {
  const text = String(value || '');
  if (!text.trim()) return;

  try {
    const parsed = JSON.parse(text);
    const visit = (node) => {
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (node && typeof node === 'object') {
        Object.entries(node).forEach(([key, child]) => {
          if (typeof child === 'string' && /(?:url|href|link)$/i.test(key)) pushCandidate(output, child, meta);
          visit(child);
        });
        return;
      }
      if (typeof node === 'string') extractCandidatesFromString(node, output, meta);
    };
    visit(parsed);
  } catch {}

  const hrefRegex = /(?:href)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(text))) pushCandidate(output, match[1], meta);

  const urlRegex = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
  while ((match = urlRegex.exec(text))) pushCandidate(output, match[0], meta);

  const unsafeSchemeRegex = /\b(?:javascript|data|file|ftp):[^\s<>"']*/gi;
  while ((match = unsafeSchemeRegex.exec(text))) pushCandidate(output, match[0], meta);
}

function dedupeCandidates(candidates) {
  const seen = new Set();
  const result = [];
  for (const candidate of candidates) {
    const key = `${candidate.source_type}|${candidate.url}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result;
}

async function classifyLink(candidate) {
  const blockedDomains = String(process.env.BLOGGAD_BLOCKED_OUTBOUND_DOMAINS || '')
    .split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);

  const base = validateSupgadUrl(candidate.url, {
    required: true,
    allowEmpty: false,
    fieldName: 'Post link',
    allowExternalLinks: true,
    allowedDomains: [],
    blockedDomains,
  });

  if (!base.ok) {
    return {
      ...candidate,
      normalized_url: base.normalized_url || null,
      host: base.detected_host || null,
      protocol: null,
      verdict: 'blocked',
      reasons: [base.message || 'Invalid or blocked URL'],
    };
  }

  let parsed;
  try {
    parsed = new URL(base.normalized_url || base.submitted_link);
  } catch {
    return {
      ...candidate,
      normalized_url: base.normalized_url || null,
      host: base.detected_host || null,
      protocol: null,
      verdict: 'blocked',
      reasons: ['URL could not be parsed safely'],
    };
  }

  const host = String(parsed.hostname || '').toLowerCase();
  const protocol = String(parsed.protocol || '').toLowerCase();
  const hardReasons = [];
  const reviewReasons = [];

  if (!['http:', 'https:'].includes(protocol)) hardReasons.push('Only HTTP and HTTPS destinations are allowed');
  if (isPrivateOrLocalHost(host)) hardReasons.push('Local, private, or reserved network destination');

  const domainRule = host ? await getOutboundDomainRule(host) : null;
  if (domainRule?.rule_status === 'block') hardReasons.push(domainRule.reason || 'Domain is blocked by Bloggad');

  if (hardReasons.length) {
    return {
      ...candidate,
      normalized_url: parsed.toString(),
      host,
      protocol,
      verdict: 'blocked',
      reasons: hardReasons,
      domain_rule: domainRule || null,
    };
  }

  if (domainRule?.rule_status === 'allow') {
    return {
      ...candidate,
      normalized_url: parsed.toString(),
      host,
      protocol,
      verdict: 'clear',
      reasons: ['Domain previously marked not suspicious by admin'],
      domain_rule: domainRule,
    };
  }

  if (domainRule?.rule_status === 'review') reviewReasons.push(domainRule.reason || 'Domain requires admin review');
  if (protocol === 'http:') reviewReasons.push('HTTP connection is not encrypted');
  if (parsed.username || parsed.password) reviewReasons.push('URL contains embedded account credentials');
  if (net.isIP(host)) reviewReasons.push('Destination uses a raw IP address');
  if (host.includes('xn--')) reviewReasons.push('Internationalized/punycode domain needs review');
  if (host.split('.').length > 6 || host.length > 120) reviewReasons.push('Unusually complex hostname');
  if (parsed.port && !['80', '443'].includes(parsed.port)) reviewReasons.push(`Non-standard destination port ${parsed.port}`);

  const suspiciousHostPattern =
    /(?:login|verify|verification|secure|wallet|password|account|support)[.-](?:login|verify|secure|wallet|account|update)|(?:free[-.]gift|crypto[-.]airdrop)/i;
  if (suspiciousHostPattern.test(host)) reviewReasons.push('Hostname contains a potentially deceptive account/security pattern');

  const suspiciousDownloadPattern = /\.(?:exe|scr|bat|cmd|ps1|msi|dmg|pkg)(?:$|[?#])/i;
  if (suspiciousDownloadPattern.test(parsed.pathname + parsed.search + parsed.hash)) {
    reviewReasons.push('Link points directly to an executable or script download');
  }

  return {
    ...candidate,
    normalized_url: parsed.toString(),
    host,
    protocol,
    verdict: reviewReasons.length ? 'review' : 'clear',
    reasons: reviewReasons.length ? reviewReasons : ['No suspicious signals found by Bloggad checks'],
    domain_rule: domainRule || null,
  };
}

async function scanAdminPostLinks(postId) {
  const [postRows] = await pool.query(
    `SELECT id,user_id,website_id,title,excerpt,seo_description,status,review_status,updated_at
     FROM product_posts WHERE id = ? LIMIT 1`,
    [postId]
  );

  const post = postRows[0];
  if (!post) {
    return {
      post_id: postId,
      title: `Post #${postId}`,
      status: 'missing',
      review_status: null,
      links: [],
      clear: false,
      error: 'Post not found',
    };
  }

  const [fields] = await pool.query(
    `SELECT id,field_key,field_type,field_value
     FROM post_template_fields WHERE post_id = ? ORDER BY sort_order ASC,id ASC`,
    [postId]
  );

  const [buttons] = await pool.query(
    `SELECT id,button_label,button_url
     FROM post_cta_buttons WHERE post_id = ? ORDER BY sort_order ASC,id ASC`,
    [postId]
  );

  const candidates = [];
  extractCandidatesFromString(post.excerpt, candidates, {
    source_type: 'post', source_id: post.id, source_label: 'Excerpt',
  });
  extractCandidatesFromString(post.seo_description, candidates, {
    source_type: 'post', source_id: post.id, source_label: 'SEO description',
  });

  for (const field of fields) {
    extractCandidatesFromString(field.field_value, candidates, {
      source_type: 'template_field',
      source_id: field.id,
      source_label: field.field_key || `Template field ${field.id}`,
    });
  }

  for (const button of buttons) {
    if (button.button_url) {
      pushCandidate(candidates, button.button_url, {
        source_type: 'cta_button',
        source_id: button.id,
        source_label: button.button_label || `CTA ${button.id}`,
      });
    }
  }

  const uniqueCandidates = dedupeCandidates(candidates);
  const links = [];

  for (const candidate of uniqueCandidates) {
    const result = await classifyLink(candidate);
    links.push(result);

    await logLinkValidation({
      userId: post.user_id || null,
      websiteId: post.website_id || null,
      sourceType: candidate.source_type,
      sourceId: post.id,
      submittedLink: result.normalized_url || result.url || '',
      detectedHost: result.host || null,
      isAllowed: result.verdict === 'clear',
      failureReason: result.verdict === 'clear' ? null : String((result.reasons || []).join(' | ')).slice(0, 255),
    });
  }

  const summary = {
    total: links.length,
    clear: links.filter((item) => item.verdict === 'clear').length,
    review: links.filter((item) => item.verdict === 'review').length,
    blocked: links.filter((item) => item.verdict === 'blocked').length,
  };

  return {
    post_id: Number(post.id),
    title: post.title,
    status: post.status,
    review_status: post.review_status || 'not_checked',
    updated_at: post.updated_at,
    links,
    summary,
    clear: summary.review === 0 && summary.blocked === 0,
  };
}

function pruneJobs() {
  const now = Date.now();
  for (const [id, job] of scanJobs.entries()) {
    if (now - job.created_at_ms > SCAN_JOB_TTL_MS) scanJobs.delete(id);
  }
}

function publicJob(job) {
  if (!job) return null;
  return {
    id: job.id,
    status: job.status,
    total: job.total,
    completed: job.completed,
    progress: job.total ? Math.round((job.completed / job.total) * 100) : 100,
    results: job.status === 'completed' ? job.results : [],
    error: job.error || null,
    created_at: job.created_at,
    completed_at: job.completed_at || null,
  };
}

function startAdminPostLinkScan({ ids, adminId }) {
  pruneJobs();
  const cleanIds = normalizeIds(ids);
  if (!cleanIds.length) throw new Error('Select at least one post');

  const id = crypto.randomUUID();
  const job = {
    id,
    admin_id: Number(adminId || 0),
    ids: cleanIds,
    total: cleanIds.length,
    completed: 0,
    status: 'queued',
    results: [],
    error: null,
    created_at: new Date().toISOString(),
    created_at_ms: Date.now(),
    completed_at: null,
  };

  scanJobs.set(id, job);

  setImmediate(async () => {
    job.status = 'running';
    try {
      for (const postId of cleanIds) {
        const result = await scanAdminPostLinks(postId);
        job.results.push(result);
        job.completed += 1;
      }
      job.status = 'completed';
      job.completed_at = new Date().toISOString();
    } catch (error) {
      job.status = 'failed';
      job.error = error.message || 'Bulk link scan failed';
      job.completed_at = new Date().toISOString();
    }
  });

  return publicJob(job);
}

function getAdminPostLinkScan({ jobId, adminId }) {
  pruneJobs();
  const job = scanJobs.get(String(jobId || ''));
  if (!job) return null;
  if (Number(job.admin_id || 0) !== Number(adminId || 0)) return null;
  return publicJob(job);
}

async function resolveAdminPostLinkDomain({ domain, decision, reason, adminId }) {
  const cleanDomain = normalizeDomainInput(domain);
  if (!cleanDomain) throw new Error('Valid domain is required');
  if (!['allow', 'block'].includes(decision)) throw new Error('Invalid domain decision');

  const [existingRows] = await pool.query(
    `SELECT id FROM outbound_domain_rules WHERE domain = ? LIMIT 1`,
    [cleanDomain]
  );

  if (existingRows[0]) {
    await pool.query(
      `UPDATE outbound_domain_rules
       SET rule_status=?,category='post_moderation',reason=?,applies_to_subdomains=1,is_active=1,created_by=?,updated_at=NOW()
       WHERE id=?`,
      [decision, reason || null, adminId || null, existingRows[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO outbound_domain_rules
       (domain,rule_status,category,reason,applies_to_subdomains,is_active,created_by,created_at,updated_at)
       VALUES (?,?,'post_moderation',?,1,1,?,NOW(),NOW())`,
      [cleanDomain, decision, reason || null, adminId || null]
    );
  }

  const [rows] = await pool.query(`SELECT * FROM outbound_domain_rules WHERE domain = ? LIMIT 1`, [cleanDomain]);
  return rows[0] || null;
}

async function approveAdminPostsAfterLinkScan({ ids, adminId }) {
  const cleanIds = normalizeIds(ids);
  if (!cleanIds.length) {
    return { ok: false, message: 'Select at least one post', results: [], approved_count: 0 };
  }

  const results = [];
  for (const postId of cleanIds) results.push(await scanAdminPostLinks(postId));

  const unresolved = results.filter(
    (post) => post.error || (post.links || []).some((link) => link.verdict !== 'clear')
  );

  if (unresolved.length) {
    return {
      ok: false,
      message: 'Some links still require review before these posts can be published',
      results,
      approved_count: 0,
    };
  }

  const placeholders = cleanIds.map(() => '?').join(',');
  const [result] = await pool.query(
    `UPDATE product_posts
     SET
       status = CASE WHEN scheduled_at IS NOT NULL AND scheduled_at > NOW() THEN 'draft' ELSE 'published' END,
       review_status = 'approved',
       writer_revision_required = 0,
       quality_blocked_reason = NULL,
       published_at = CASE
         WHEN scheduled_at IS NOT NULL AND scheduled_at > NOW() THEN NULL
         ELSE COALESCE(published_at, NOW())
       END,
       updated_at = NOW()
     WHERE id IN (${placeholders})`,
    cleanIds
  );

  return {
    ok: true,
    message: 'Selected posts approved successfully',
    results,
    approved_count: Number(result.affectedRows || 0),
    admin_id: adminId || null,
  };
}

module.exports = {
  scanAdminPostLinks,
  startAdminPostLinkScan,
  getAdminPostLinkScan,
  resolveAdminPostLinkDomain,
  approveAdminPostsAfterLinkScan,
};
