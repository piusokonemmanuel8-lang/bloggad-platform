const pool = require('../config/db');
const { getCurrentPaidWriterSubscription } = require('../services/writerReaderAccessService');

function cleanText(value, max = 255) {
  if (value === undefined || value === null) return null;
  return String(value).trim().slice(0, max);
}
function positiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
function makeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}
function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}
function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}
function sendError(res, error, fallback) {
  const status = Number(error?.status || 500);
  return res.status(status >= 400 && status <= 599 ? status : 500).json({
    ok: false,
    message: error?.message || fallback,
  });
}
function entitlementFromPlan(plan) {
  const features = parseJson(plan?.features_json, {});
  const enabled = features.sales_landing_pages_enabled === true;
  const rawLimit = features.sales_landing_page_limit;
  const limit = rawLimit === null || rawLimit === undefined ? null : Number(rawLimit);
  return {
    enabled,
    limit: Number.isFinite(limit) ? limit : null,
    plan_name: plan?.plan_name || null,
  };
}
async function requireLandingEntitlement(userId, connection = pool) {
  const plan = await getCurrentPaidWriterSubscription(userId, connection);
  if (!plan) throw fail('An active paid Writer plan is required for Sales Landing Pages.', 403);
  const entitlement = entitlementFromPlan(plan);
  if (!entitlement.enabled) throw fail('Sales Landing Pages are not enabled for this Writer plan.', 403);
  return entitlement;
}
async function uniqueSlug(slug, ignoreId = null, connection = pool) {
  let sql = 'SELECT id FROM writer_sales_landing_pages WHERE slug=?';
  const params = [slug];
  if (ignoreId) { sql += ' AND id<>?'; params.push(ignoreId); }
  const [rows] = await connection.query(sql + ' LIMIT 1', params);
  if (rows.length) throw fail('That landing page URL is already in use.', 409);
}
async function listMine(req, res) {
  try {
    const userId = req.user.id;
    const entitlement = await requireLandingEntitlement(userId);
    const [pages] = await pool.query(
      `SELECT p.*,t.name AS template_name,t.template_key
       FROM writer_sales_landing_pages p
       LEFT JOIN sales_landing_templates t ON t.id=p.template_id
       WHERE p.writer_user_id=? ORDER BY p.updated_at DESC,p.id DESC`,
      [userId]
    );
    return res.json({ ok: true, pages, entitlement });
  } catch (error) { return sendError(res, error, 'Failed to load Sales Landing Pages.'); }
}
async function listTemplates(req, res) {
  try {
    await requireLandingEntitlement(req.user.id);
    const [templates] = await pool.query(
      `SELECT id,name,slug,preview_image,template_key,description,template_json,sort_order
       FROM sales_landing_templates WHERE status='active' ORDER BY sort_order ASC,id ASC`
    );
    return res.json({ ok: true, templates });
  } catch (error) { return sendError(res, error, 'Failed to load Sales Landing Page templates.'); }
}
async function createPage(req, res) {
  const db = await pool.getConnection();
  try {
    const userId = req.user.id;
    const title = cleanText(req.body?.title, 255);
    if (!title) throw fail('Landing page title is required.');
    await db.beginTransaction();
    const entitlement = await requireLandingEntitlement(userId, db);
    const [[countRow]] = await db.query(
      'SELECT COUNT(*) AS total FROM writer_sales_landing_pages WHERE writer_user_id=?',
      [userId]
    );
    if (entitlement.limit !== null && Number(countRow.total || 0) >= entitlement.limit) {
      throw fail(`Your ${entitlement.plan_name || 'Writer'} plan allows ${entitlement.limit} Sales Landing Page${entitlement.limit === 1 ? '' : 's'}.`, 403);
    }
    const templateId = positiveInt(req.body?.template_id);
    if (templateId) {
      const [templates] = await db.query(
        "SELECT id FROM sales_landing_templates WHERE id=? AND status='active' LIMIT 1",
        [templateId]
      );
      if (!templates.length) throw fail('Selected landing page template is unavailable.', 404);
    }
    const slug = makeSlug(req.body?.slug || title);
    if (!slug) throw fail('A valid landing page URL could not be generated.');
    await uniqueSlug(slug, null, db);
    const content = req.body?.content_json === undefined ? {} : parseJson(req.body.content_json, {});
    const [result] = await db.query(
      `INSERT INTO writer_sales_landing_pages
       (writer_user_id,template_id,title,slug,content_json,seo_title,seo_description,status,published_at,created_at,updated_at)
       VALUES(?,?,?,?,?,?,?,'draft',NULL,NOW(),NOW())`,
      [userId, templateId, title, slug, JSON.stringify(content),
       cleanText(req.body?.seo_title,255), cleanText(req.body?.seo_description,500)]
    );
    await db.commit();
    return res.status(201).json({ ok: true, page_id: Number(result.insertId), message: 'Sales Landing Page created.' });
  } catch (error) {
    try { await db.rollback(); } catch {}
    return sendError(res, error, 'Failed to create Sales Landing Page.');
  } finally { db.release(); }
}
async function getMine(req, res) {
  try {
    await requireLandingEntitlement(req.user.id);
    const id = positiveInt(req.params.pageId);
    if (!id) throw fail('Valid landing page ID is required.');
    const [rows] = await pool.query(
      `SELECT p.*,t.name AS template_name,t.template_key,t.template_json
       FROM writer_sales_landing_pages p
       LEFT JOIN sales_landing_templates t ON t.id=p.template_id
       WHERE p.id=? AND p.writer_user_id=? LIMIT 1`,
      [id, req.user.id]
    );
    if (!rows.length) throw fail('Sales Landing Page not found.', 404);
    return res.json({ ok: true, page: rows[0] });
  } catch (error) { return sendError(res, error, 'Failed to load Sales Landing Page.'); }
}
async function updatePage(req, res) {
  const db = await pool.getConnection();
  try {
    const userId = req.user.id;
    const id = positiveInt(req.params.pageId);
    if (!id) throw fail('Valid landing page ID is required.');
    await db.beginTransaction();
    await requireLandingEntitlement(userId, db);
    const [rows] = await db.query(
      'SELECT * FROM writer_sales_landing_pages WHERE id=? AND writer_user_id=? LIMIT 1 FOR UPDATE',
      [id, userId]
    );
    const old = rows[0];
    if (!old) throw fail('Sales Landing Page not found.', 404);
    const title = req.body?.title !== undefined ? cleanText(req.body.title,255) : old.title;
    if (!title) throw fail('Landing page title is required.');
    const slug = req.body?.slug !== undefined ? makeSlug(req.body.slug || title) : old.slug;
    if (!slug) throw fail('A valid landing page URL is required.');
    await uniqueSlug(slug, id, db);
    let templateId = req.body?.template_id !== undefined ? positiveInt(req.body.template_id) : old.template_id;
    if (templateId) {
      const [templates] = await db.query(
        "SELECT id FROM sales_landing_templates WHERE id=? AND status='active' LIMIT 1",
        [templateId]
      );
      if (!templates.length) throw fail('Selected landing page template is unavailable.', 404);
    }
    const content = req.body?.content_json !== undefined ? parseJson(req.body.content_json,{}) : parseJson(old.content_json,{});
    await db.query(
      `UPDATE writer_sales_landing_pages
       SET template_id=?,title=?,slug=?,content_json=?,seo_title=?,seo_description=?,updated_at=NOW()
       WHERE id=? AND writer_user_id=?`,
      [templateId,title,slug,JSON.stringify(content),
       req.body?.seo_title!==undefined?cleanText(req.body.seo_title,255):old.seo_title,
       req.body?.seo_description!==undefined?cleanText(req.body.seo_description,500):old.seo_description,
       id,userId]
    );
    await db.commit();
    return res.json({ ok:true, message:'Sales Landing Page updated.' });
  } catch (error) {
    try { await db.rollback(); } catch {}
    return sendError(res,error,'Failed to update Sales Landing Page.');
  } finally { db.release(); }
}
async function publishPage(req, res) {
  try {
    await requireLandingEntitlement(req.user.id);
    const id = positiveInt(req.params.pageId);
    if (!id) throw fail('Valid landing page ID is required.');
    const [result] = await pool.query(
      `UPDATE writer_sales_landing_pages
       SET status='published',published_at=COALESCE(published_at,NOW()),updated_at=NOW()
       WHERE id=? AND writer_user_id=?`,
      [id,req.user.id]
    );
    if (!result.affectedRows) throw fail('Sales Landing Page not found.',404);
    return res.json({ok:true,message:'Sales Landing Page published.'});
  } catch(error){return sendError(res,error,'Failed to publish Sales Landing Page.');}
}
async function unpublishPage(req, res) {
  try {
    await requireLandingEntitlement(req.user.id);
    const id = positiveInt(req.params.pageId);
    if (!id) throw fail('Valid landing page ID is required.');
    const [result] = await pool.query(
      `UPDATE writer_sales_landing_pages SET status='draft',updated_at=NOW()
       WHERE id=? AND writer_user_id=?`,
      [id,req.user.id]
    );
    if (!result.affectedRows) throw fail('Sales Landing Page not found.',404);
    return res.json({ok:true,message:'Sales Landing Page returned to draft.'});
  } catch(error){return sendError(res,error,'Failed to unpublish Sales Landing Page.');}
}
async function deletePage(req, res) {
  try {
    await requireLandingEntitlement(req.user.id);
    const id = positiveInt(req.params.pageId);
    if (!id) throw fail('Valid landing page ID is required.');
    const [result] = await pool.query(
      'DELETE FROM writer_sales_landing_pages WHERE id=? AND writer_user_id=?',
      [id,req.user.id]
    );
    if (!result.affectedRows) throw fail('Sales Landing Page not found.',404);
    return res.json({ok:true,message:'Sales Landing Page deleted.'});
  } catch(error){return sendError(res,error,'Failed to delete Sales Landing Page.');}
}
async function publicPage(req, res) {
  try {
    const slug = makeSlug(req.params.slug);
    const [rows] = await pool.query(
      `SELECT p.id,p.writer_user_id,p.template_id,p.title,p.slug,p.content_json,p.seo_title,p.seo_description,
              p.published_at,t.name AS template_name,t.template_key,t.template_json
       FROM writer_sales_landing_pages p
       LEFT JOIN sales_landing_templates t ON t.id=p.template_id AND t.status='active'
       WHERE p.slug=? AND p.status='published' LIMIT 1`,
      [slug]
    );
    if (!rows.length) throw fail('Sales Landing Page not found.',404);
    return res.json({ok:true,page:rows[0]});
  } catch(error){return sendError(res,error,'Failed to load Sales Landing Page.');}
}
module.exports = {
  listMine,listTemplates,createPage,getMine,updatePage,publishPage,unpublishPage,deletePage,publicPage,
};