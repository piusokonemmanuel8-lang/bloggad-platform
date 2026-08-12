const pool = require('../config/db');
const { getCurrentPaidWriterSubscription } = require('./writerReaderAccessService');

function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}
function positiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}
function cleanText(value, max = 255) {
  const text = String(value || '').trim();
  return text ? text.slice(0, max) : null;
}
function makeSlug(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180);
}
function boolValue(value, fallback = false) {
  if (value === undefined || value === null || value === '') return !!fallback;
  if (typeof value === 'boolean') return value;
  const text = String(value).trim().toLowerCase();
  if (['1','true','yes','on'].includes(text)) return true;
  if (['0','false','no','off'].includes(text)) return false;
  return !!fallback;
}
function ids(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(positiveInt).filter(Boolean))];
}

async function getWriterStorefront(userId, db = pool) {
  const [rows] = await db.query(
    `SELECT id,user_id,website_name,slug,logo,banner,status
     FROM affiliate_websites WHERE user_id=? ORDER BY id ASC LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}
async function getWriterPages(userId, db = pool, activeOnly = false) {
  const [rows] = await db.query(
    `SELECT id,user_id,name,slug,logo_url,banner_url,bio,about_text,is_primary,status,created_at,updated_at
     FROM writer_pages WHERE user_id=? ${activeOnly ? "AND status='active'" : ''}
     ORDER BY is_primary DESC,updated_at DESC,id ASC`,
    [userId]
  );
  return rows.map((row) => ({ ...row, id:Number(row.id), user_id:Number(row.user_id), is_primary:!!row.is_primary }));
}
async function getPrimaryWriterPage(userId, db = pool) {
  const [rows] = await db.query(
    `SELECT id,user_id,name,slug,logo_url,banner_url,bio,about_text,is_primary,status
     FROM writer_pages WHERE user_id=? AND is_primary=1 ORDER BY id ASC LIMIT 1`,
    [userId]
  );
  return rows[0] ? { ...rows[0], id:Number(rows[0].id), user_id:Number(rows[0].user_id), is_primary:true } : null;
}
async function ensurePrimaryWriterPage(userId, db = pool) {
  const existing = await getPrimaryWriterPage(userId, db);
  if (existing) return existing;

  const [rows] = await db.query(
    `SELECT u.id,u.name,u.status AS user_status,wp.display_name,wp.pen_name,wp.slug AS profile_slug,
            wp.tagline,wp.bio AS profile_bio,wp.avatar_url,wp.cover_url,wp.status AS profile_status
     FROM users u LEFT JOIN writer_profiles wp ON wp.user_id=u.id
     WHERE u.id=? AND u.role='affiliate' LIMIT 1`,
    [userId]
  );
  const row = rows[0];
  if (!row) throw fail('Writer account not found.', 404);

  const name = cleanText(row.pen_name,180) || cleanText(row.display_name,180) || cleanText(row.name,180) || `Writer ${userId}`;
  const base = makeSlug(row.profile_slug) || makeSlug(name) || `writer-${userId}`;
  let slug = base;
  for (let n=2;;n+=1) {
    const [taken] = await db.query(`SELECT id FROM writer_pages WHERE slug=? LIMIT 1`,[slug]);
    if (!taken.length) break;
    slug = `${base.slice(0,165)}-${n}`;
  }

  await db.query(`UPDATE writer_pages SET is_primary=0 WHERE user_id=?`,[userId]);
  const [result] = await db.query(
    `INSERT INTO writer_pages
     (user_id,name,slug,logo_url,banner_url,bio,about_text,is_primary,status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,1,?,NOW(),NOW())`,
    [userId,name,slug,cleanText(row.avatar_url,500),cleanText(row.cover_url,500),
     cleanText(row.tagline,500),cleanText(row.profile_bio,100000),
     row.user_status==='active' && row.profile_status!=='suspended' ? 'active' : 'inactive']
  );
  const [created] = await db.query(`SELECT * FROM writer_pages WHERE id=? LIMIT 1`,[result.insertId]);
  return { ...created[0], id:Number(created[0].id), user_id:Number(created[0].user_id), is_primary:true };
}
async function getWriterEntitlement(userId, db = pool) {
  const plan = await getCurrentPaidWriterSubscription(userId, db);
  return {
    paid_writer:!!plan,
    paid_writer_plan:plan || null,
    page_limit:plan ? null : 1,
    storefront_limit:plan ? 1 : 0,
    can_create_storefront:!!plan,
    can_place_on_storefront:!!plan,
  };
}
async function getPostPlacement(postId,userId,db=pool) {
  const id = positiveInt(postId);
  if (!id) return null;
  const [postRows] = await db.query(
    `SELECT id,website_id,show_on_storefront,content_type FROM product_posts WHERE id=? AND user_id=? LIMIT 1`,
    [id,userId]
  );
  if (!postRows[0]) return null;
  const [pageRows] = await db.query(
    `SELECT wpp.page_id FROM writer_post_page_placements wpp
     INNER JOIN writer_pages wp ON wp.id=wpp.page_id
     WHERE wpp.post_id=? AND wp.user_id=? ORDER BY wpp.id ASC`,
    [id,userId]
  );
  return {
    post_id:id,
    website_id:postRows[0].website_id ? Number(postRows[0].website_id) : null,
    show_on_storefront:!!postRows[0].show_on_storefront,
    content_type:postRows[0].content_type,
    page_ids:pageRows.map((row)=>Number(row.page_id)),
  };
}
async function getWriterPublishingContext(userId,{postId=null}={},db=pool) {
  await ensurePrimaryWriterPage(userId,db);
  const [entitlement,pages,rawStorefront,placement] = await Promise.all([
    getWriterEntitlement(userId,db),
    getWriterPages(userId,db),
    getWriterStorefront(userId,db),
    postId ? getPostPlacement(postId,userId,db) : null,
  ]);
  return {
    entitlement,
    pages,
    primary_page:pages.find((page)=>page.is_primary) || null,
    storefront:entitlement.paid_writer && rawStorefront ? { ...rawStorefront,id:Number(rawStorefront.id),user_id:Number(rawStorefront.user_id) } : null,
    existing_storefront_without_paid_entitlement:!!rawStorefront && !entitlement.paid_writer,
    placement,
  };
}
async function validatePageIds(userId,pageIds,db=pool) {
  const selected = ids(pageIds);
  if (!selected.length) return [];
  const marks = selected.map(()=>'?').join(',');
  const [rows] = await db.query(
    `SELECT id FROM writer_pages WHERE user_id=? AND status='active' AND id IN (${marks})`,
    [userId,...selected]
  );
  const owned = new Set(rows.map((row)=>Number(row.id)));
  if (selected.some((id)=>!owned.has(id))) throw fail('One or more selected Pages are invalid, inactive, or not owned by this Writer.');
  return selected;
}
async function resolveWriterPostPlacement({
  writerUserId,pageIds,showOnStorefront,currentPostId=null,contentType='article',isCreate=false,connection=pool,
}) {
  const context = await getWriterPublishingContext(writerUserId,{postId:currentPostId},connection);
  let selected = Array.isArray(pageIds) ? ids(pageIds) : (!isCreate && context.placement ? context.placement.page_ids : []);
  if (!selected.length && context.primary_page) selected=[Number(context.primary_page.id)];
  selected = await validatePageIds(writerUserId,selected,connection);
  if (!selected.length) throw fail('Choose at least one active Writer Page.');

  let onStore;
  if (showOnStorefront === undefined) {
    onStore = !isCreate && context.placement
      ? !!context.placement.show_on_storefront
      : String(contentType||'').toLowerCase()==='product_post' && !!context.entitlement.paid_writer && !!context.storefront;
  } else {
    onStore = boolValue(showOnStorefront,false);
  }
  if (onStore && (!context.entitlement.can_place_on_storefront || !context.storefront)) {
    throw fail('An active paid Writer plan and Storefront are required for Storefront placement.',403);
  }
  return {
    page_ids:selected,
    show_on_storefront:onStore,
    website_id:onStore && context.storefront ? Number(context.storefront.id) : null,
    primary_page:context.primary_page,
    storefront:context.storefront,
    entitlement:context.entitlement,
  };
}
async function replacePostPagePlacements({postId,writerUserId,pageIds,connection=pool}) {
  const id = positiveInt(postId);
  if (!id) throw fail('Valid post ID is required.');
  const selected = await validatePageIds(writerUserId,pageIds,connection);
  if (!selected.length) throw fail('At least one Writer Page placement is required.');
  await connection.query(`DELETE FROM writer_post_page_placements WHERE post_id=?`,[id]);
  for (const pageId of selected) {
    await connection.query(
      `INSERT INTO writer_post_page_placements(post_id,page_id,created_at) VALUES(?,?,NOW())`,
      [id,pageId]
    );
  }
  return selected;
}

module.exports = {
  fail,positiveInt,cleanText,makeSlug,boolValue,getWriterStorefront,getWriterPages,getPrimaryWriterPage,
  ensurePrimaryWriterPage,getWriterEntitlement,getPostPlacement,getWriterPublishingContext,
  resolveWriterPostPlacement,replacePostPagePlacements,
};