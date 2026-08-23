const pool = require('../config/db');
const { buildPublicPostAccessPayload,getPostFields,getPostCtas } = require('../services/writerReaderAccessService');
const { trackPostView } = require('../services/analyticsService');
// BLOGGAD_BG_ATTRIBUTION_AND_TRAFFIC_SYNC_V1
const {
  decoratePublicPostPayload,
} = require('../services/supgadBloggadAttributionService');
const {
  fail,positiveInt,cleanText,makeSlug,boolValue,getWriterPages,getWriterPublishingContext,
  getWriterEntitlement,getPrimaryWriterPage,ensurePrimaryWriterPage,getWriterStorefront,
} = require('../services/writerPageService');

function sendError(res,error,fallback) {
  const n=Number(error?.status||500);
  return res.status(Number.isInteger(n)&&n>=400&&n<=599?n:500).json({ok:false,message:error?.message||fallback});
}
async function uniqueSlug(slug,ignore=null,db=pool) {
  let sql=`SELECT id FROM writer_pages WHERE slug=?`;
  const params=[slug];
  if(ignore){sql+=` AND id<>?`;params.push(ignore);}
  const [rows]=await db.query(sql+` LIMIT 1`,params);
  if(rows.length) throw fail('That Page URL is already in use.',409);
}
async function listMyWriterPages(req,res) {
  try { return res.json({ok:true,...await getWriterPublishingContext(req.user.id)}); }
  catch(error){return sendError(res,error,'Failed to load Writer Pages.');}
}
async function getMyWriterPageContext(req,res) {
  try { return res.json({ok:true,...await getWriterPublishingContext(req.user.id,{postId:positiveInt(req.query?.post_id)})}); }
  catch(error){return sendError(res,error,'Failed to load publishing destinations.');}
}
async function createWriterPage(req,res) {
  const db=await pool.getConnection();
  try{
    const userId=req.user.id;
    const name=cleanText(req.body?.name,180);
    if(!name) throw fail('Page name is required.');
    await db.beginTransaction();
    await ensurePrimaryWriterPage(userId,db);
    const [entitlement,pages]=await Promise.all([getWriterEntitlement(userId,db),getWriterPages(userId,db)]);
    if(entitlement.page_limit!==null && pages.length>=Number(entitlement.page_limit)) {
      throw fail('Free Writers can have one Page. Upgrade your Writer plan to create unlimited Pages.',403);
    }
    const slug=makeSlug(req.body?.slug||name);
    if(!slug) throw fail('A valid Page URL could not be generated.');
    await uniqueSlug(slug,null,db);
    const primary=!pages.length || boolValue(req.body?.is_primary,false);
    if(primary) await db.query(`UPDATE writer_pages SET is_primary=0 WHERE user_id=?`,[userId]);
    const [result]=await db.query(
      `INSERT INTO writer_pages(user_id,name,slug,logo_url,banner_url,bio,about_text,is_primary,status,created_at,updated_at)
       VALUES(?,?,?,?,?,?,?,?, 'active',NOW(),NOW())`,
      [userId,name,slug,cleanText(req.body?.logo_url,500),cleanText(req.body?.banner_url,500),
       cleanText(req.body?.bio,500),cleanText(req.body?.about_text,100000),primary?1:0]
    );
    await db.commit();
    return res.status(201).json({ok:true,message:'Writer Page created.',page_id:Number(result.insertId),pages:await getWriterPages(userId),entitlement});
  }catch(error){try{await db.rollback();}catch{} return sendError(res,error,'Failed to create Writer Page.');}
  finally{db.release();}
}
async function updateWriterPage(req,res) {
  const db=await pool.getConnection();
  try{
    const userId=req.user.id,pageId=positiveInt(req.params.pageId);
    if(!pageId) throw fail('Valid Page ID is required.');
    await db.beginTransaction();
    const [rows]=await db.query(`SELECT * FROM writer_pages WHERE id=? AND user_id=? LIMIT 1 FOR UPDATE`,[pageId,userId]);
    const old=rows[0];
    if(!old) throw fail('Writer Page not found.',404);
    const name=req.body?.name!==undefined?cleanText(req.body.name,180):old.name;
    if(!name) throw fail('Page name is required.');
    const slug=req.body?.slug!==undefined?makeSlug(req.body.slug||name):old.slug;
    if(!slug) throw fail('A valid Page URL is required.');
    await uniqueSlug(slug,pageId,db);
    const status=req.body?.status!==undefined?String(req.body.status).trim().toLowerCase():old.status;
    if(!['active','inactive'].includes(status)) throw fail('Page status must be active or inactive.');
    if(old.is_primary && status!=='active') throw fail('Choose another primary Page before deactivating this Page.');
    const primary=req.body?.is_primary!==undefined?boolValue(req.body.is_primary,!!old.is_primary):!!old.is_primary;
    if(primary) await db.query(`UPDATE writer_pages SET is_primary=0 WHERE user_id=?`,[userId]);
    if(!primary && old.is_primary) throw fail('A Writer must always have one primary Page.');
    await db.query(
      `UPDATE writer_pages SET name=?,slug=?,logo_url=?,banner_url=?,bio=?,about_text=?,is_primary=?,status=?,updated_at=NOW()
       WHERE id=? AND user_id=?`,
      [name,slug,req.body?.logo_url!==undefined?cleanText(req.body.logo_url,500):old.logo_url,
       req.body?.banner_url!==undefined?cleanText(req.body.banner_url,500):old.banner_url,
       req.body?.bio!==undefined?cleanText(req.body.bio,500):old.bio,
       req.body?.about_text!==undefined?cleanText(req.body.about_text,100000):old.about_text,
       primary?1:0,status,pageId,userId]
    );
    await db.commit();
    return res.json({ok:true,message:'Writer Page updated.',pages:await getWriterPages(userId)});
  }catch(error){try{await db.rollback();}catch{} return sendError(res,error,'Failed to update Writer Page.');}
  finally{db.release();}
}
async function setPrimaryWriterPage(req,res) {
  const db=await pool.getConnection();
  try{
    const userId=req.user.id,pageId=positiveInt(req.params.pageId);
    if(!pageId) throw fail('Valid Page ID is required.');
    await db.beginTransaction();
    const [rows]=await db.query(`SELECT id,status FROM writer_pages WHERE id=? AND user_id=? LIMIT 1 FOR UPDATE`,[pageId,userId]);
    if(!rows[0]) throw fail('Writer Page not found.',404);
    if(rows[0].status!=='active') throw fail('Only an active Page can be primary.');
    await db.query(`UPDATE writer_pages SET is_primary=0,updated_at=NOW() WHERE user_id=?`,[userId]);
    await db.query(`UPDATE writer_pages SET is_primary=1,updated_at=NOW() WHERE id=? AND user_id=?`,[pageId,userId]);
    await db.commit();
    return res.json({ok:true,message:'Primary Writer Page updated.',pages:await getWriterPages(userId)});
  }catch(error){try{await db.rollback();}catch{} return sendError(res,error,'Failed to update primary Writer Page.');}
  finally{db.release();}
}
async function deleteWriterPage(req,res) {
  const db=await pool.getConnection();
  try{
    const userId=req.user.id,pageId=positiveInt(req.params.pageId);
    if(!pageId) throw fail('Valid Page ID is required.');
    await db.beginTransaction();
    const [pages]=await db.query(`SELECT id,is_primary,status FROM writer_pages WHERE user_id=? ORDER BY is_primary DESC,id ASC FOR UPDATE`,[userId]);
    const target=pages.find((p)=>Number(p.id)===pageId);
    if(!target) throw fail('Writer Page not found.',404);
    if(pages.length<=1) throw fail('A Writer must keep at least one Page.');
    const [counts]=await db.query(`SELECT COUNT(*) AS total FROM writer_post_page_placements WHERE page_id=?`,[pageId]);
    if(Number(counts[0]?.total||0)>0) throw fail('Move this Page off its posts before deleting it.',409);
    await db.query(`DELETE FROM writer_pages WHERE id=? AND user_id=?`,[pageId,userId]);
    if(target.is_primary){
      const next=pages.find((p)=>Number(p.id)!==pageId && p.status==='active');
      if(!next) throw fail('An active replacement primary Page is required.');
      await db.query(`UPDATE writer_pages SET is_primary=1,updated_at=NOW() WHERE id=? AND user_id=?`,[next.id,userId]);
    }
    await db.commit();
    return res.json({ok:true,message:'Writer Page deleted.',pages:await getWriterPages(userId)});
  }catch(error){try{await db.rollback();}catch{} return sendError(res,error,'Failed to delete Writer Page.');}
  finally{db.release();}
}
async function loadPublicPage(slug) {
  const [rows]=await pool.query(
    `SELECT pg.*,u.name AS account_name,wp.display_name,wp.pen_name,wp.tagline AS writer_tagline,
            wp.bio AS writer_bio,wp.avatar_url AS writer_avatar_url,wp.cover_url AS writer_cover_url
     FROM writer_pages pg
     INNER JOIN users u ON u.id=pg.user_id AND u.status='active'
     LEFT JOIN writer_profiles wp ON wp.user_id=pg.user_id AND wp.status='active'
     WHERE pg.slug=? AND pg.status='active' LIMIT 1`,[slug]
  );
  return rows[0]||null;
}
async function publicPayload(page) {
  const userId=Number(page.user_id);
  const [followers,members,reactions,appreciations,storefront,postRows]=await Promise.all([
    pool.query(`SELECT COUNT(*) AS total FROM writer_follows WHERE writer_user_id=?`,[userId]),
    pool.query(`SELECT COUNT(*) AS total FROM writer_memberships WHERE writer_user_id=? AND status='active' AND ends_at>NOW()`,[userId]),
    pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN pr.reaction_type='love' THEN 1 ELSE 0 END),0) AS love_count,
         COALESCE(SUM(CASE WHEN pr.reaction_type='applaud' THEN 1 ELSE 0 END),0) AS applaud_count
       FROM post_reactions pr
       INNER JOIN product_posts pp ON pp.id=pr.post_id
       WHERE pp.user_id=? AND pp.status='published'`,
      [userId]
    ),
    pool.query(
      `SELECT COUNT(*) AS appreciation_count
       FROM writer_appreciations
       WHERE writer_user_id=? AND status='completed'`,
      [userId]
    ),
    getWriterStorefront(userId),
    pool.query(
      `SELECT pp.id,pp.user_id,pp.website_id,pp.product_id,pp.content_type,pp.title,pp.slug,pp.excerpt,
              pp.featured_image,pp.published_at,pp.created_at,c.name AS category_name,c.slug AS category_slug,
              COALESCE(prc.love_count,0) AS love_count,
              COALESCE(prc.applaud_count,0) AS applaud_count
       FROM writer_post_page_placements x
       INNER JOIN product_posts pp ON pp.id=x.post_id AND pp.status='published'
       LEFT JOIN categories c ON c.id=pp.category_id
       LEFT JOIN (
         SELECT
           post_id,
           SUM(CASE WHEN reaction_type='love' THEN 1 ELSE 0 END) AS love_count,
           SUM(CASE WHEN reaction_type='applaud' THEN 1 ELSE 0 END) AS applaud_count
         FROM post_reactions
         GROUP BY post_id
       ) prc ON prc.post_id=pp.id
       WHERE x.page_id=? ORDER BY COALESCE(pp.published_at,pp.created_at) DESC,pp.id DESC LIMIT 200`,
      [page.id]
    )
  ]);
  return {
    page:{id:Number(page.id),user_id:userId,name:page.name,slug:page.slug,logo_url:page.logo_url,banner_url:page.banner_url,
          bio:page.bio,about_text:page.about_text,is_primary:!!page.is_primary,status:page.status},
    writer:{user_id:userId,public_name:cleanText(page.pen_name,180)||cleanText(page.display_name,180)||cleanText(page.account_name,180)||page.name,
            display_name:page.display_name,pen_name:page.pen_name,tagline:page.writer_tagline,bio:page.writer_bio,
            avatar_url:page.writer_avatar_url,cover_url:page.writer_cover_url,
            follower_count:Number(followers[0][0]?.total||0),
            member_count:Number(members[0][0]?.total||0),
            love_count:Number(reactions[0][0]?.love_count||0),
            applaud_count:Number(reactions[0][0]?.applaud_count||0),
            appreciation_count:Number(appreciations[0][0]?.appreciation_count||0)},
    storefront:storefront && storefront.status==='active'
      ? {id:Number(storefront.id),name:storefront.website_name,slug:storefront.slug,logo:storefront.logo,banner:storefront.banner}
      : null,
    posts:postRows[0].map((row)=>({...row,id:Number(row.id),user_id:Number(row.user_id),
      website_id:row.website_id?Number(row.website_id):null,product_id:row.product_id?Number(row.product_id):null,
      love_count:Number(row.love_count||0),applaud_count:Number(row.applaud_count||0),page_slug:page.slug}))
  };
}

async function getPublicWriterPage(req,res) {
  try{
    const page=await loadPublicPage(makeSlug(req.params.pageSlug));
    if(!page) throw fail('Writer Page not found.',404);
    return res.json({ok:true,...await publicPayload(page)});
  }catch(error){return sendError(res,error,'Failed to load Writer Page.');}
}
async function getPublicPrimaryWriterPage(req,res) {
  try{
    const writerId=positiveInt(req.params.writerId);
    if(!writerId) throw fail('Valid Writer ID is required.');
    const page=await getPrimaryWriterPage(writerId);
    if(!page || page.status!=='active') throw fail('Primary Writer Page not found.',404);
    return res.json({ok:true,page});
  }catch(error){return sendError(res,error,'Failed to resolve primary Writer Page.');}
}
async function getPublicWriterPagePost(req,res) {
  try{
    const page=await loadPublicPage(makeSlug(req.params.pageSlug));
    if(!page) throw fail('Writer Page not found.',404);
    const postSlug=String(req.params.postSlug||'').trim();
    const [rows]=await pool.query(
      `SELECT pp.*,aw.website_name,aw.slug AS website_slug,p.title AS product_title,p.slug AS product_slug,
              p.product_image,p.pricing_type,p.price,p.min_price,p.max_price,p.affiliate_buy_url,
              c.name AS category_name,c.slug AS category_slug
       FROM writer_post_page_placements x
       INNER JOIN product_posts pp ON pp.id=x.post_id AND pp.status='published'
       LEFT JOIN affiliate_websites aw ON aw.id=pp.website_id
       LEFT JOIN products p ON p.id=pp.product_id
       LEFT JOIN categories c ON c.id=pp.category_id
       WHERE x.page_id=? AND pp.slug=? LIMIT 1`,[page.id,postSlug]
    );
    const row=rows[0];
    if(!row) throw fail('Published post not found on this Page.',404);
    const post={
      id:Number(row.id),product_id:row.product_id?Number(row.product_id):null,content_type:row.content_type,
      user_id:Number(row.user_id),website_id:row.website_id?Number(row.website_id):null,
      category_id:row.category_id?Number(row.category_id):null,template_id:Number(row.template_id),title:row.title,
      slug:row.slug,excerpt:row.excerpt,seo_title:row.seo_title,seo_description:row.seo_description,
      featured_image:row.featured_image,media_id:row.media_id,status:row.status,published_at:row.published_at,
      scheduled_at:row.scheduled_at,created_at:row.created_at,updated_at:row.updated_at,page_slug:page.slug,
      website:row.website_id?{id:Number(row.website_id),website_name:row.website_name,slug:row.website_slug}:null,
      product:row.product_id?{id:Number(row.product_id),title:row.product_title,slug:row.product_slug,
        product_image:row.product_image,pricing_type:row.pricing_type,price:row.price===null?null:Number(row.price),
        min_price:row.min_price===null?null:Number(row.min_price),max_price:row.max_price===null?null:Number(row.max_price),
        affiliate_buy_url:row.affiliate_buy_url}:null,
      category:row.category_id?{id:Number(row.category_id),name:row.category_name,slug:row.category_slug}:null,
    };
    // BLOGGAD_WRITER_PAGE_POST_VIEW_TRACKING_V1
    try {
      await trackPostView({
        postId: post.id,
        productId: post.product_id || null,
        websiteId: post.website_id || null,
        ipAddress: req.ip || null,
        referrer: req.get('referer') || null,
        userAgent: req.get('user-agent') || null,
      });
    } catch (analyticsError) {
      console.error('trackWriterPagePostView error:', analyticsError.message);
    }

    const [fields,ctas]=await Promise.all([getPostFields(post.id),getPostCtas(post.id)]);
    const publicPostPayload=decoratePublicPostPayload(
      await buildPublicPostAccessPayload({post,fields,ctaButtons:ctas}),
      post
    );
    return res.json({ok:true,page:{id:Number(page.id),user_id:Number(page.user_id),name:page.name,slug:page.slug,
      logo_url:page.logo_url,banner_url:page.banner_url,bio:page.bio,is_primary:!!page.is_primary},
      ...publicPostPayload});
  }catch(error){return sendError(res,error,'Failed to load Writer Page post.');}
}
module.exports={listMyWriterPages,getMyWriterPageContext,createWriterPage,updateWriterPage,setPrimaryWriterPage,
  deleteWriterPage,getPublicWriterPage,getPublicPrimaryWriterPage,getPublicWriterPagePost};