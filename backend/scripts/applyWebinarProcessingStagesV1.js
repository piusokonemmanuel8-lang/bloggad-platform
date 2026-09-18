const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../src/config/db');
async function main(){
 const [columns]=await pool.query("SHOW COLUMNS FROM webinar_media_jobs");
 const names=new Set(columns.map((row)=>row.Field));
 if(!names.has('processing_stage'))await pool.query("ALTER TABLE webinar_media_jobs ADD COLUMN processing_stage VARCHAR(40) NOT NULL DEFAULT 'queued' AFTER status");
 if(!names.has('progress_percent'))await pool.query("ALTER TABLE webinar_media_jobs ADD COLUMN progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER processing_stage");
 if(!names.has('stage_updated_at'))await pool.query("ALTER TABLE webinar_media_jobs ADD COLUMN stage_updated_at DATETIME NULL AFTER progress_percent");
 const [recovery]=await pool.query("UPDATE webinar_media_jobs SET status='queued', processing_stage='queued', progress_percent=0, claimed_at=NULL, stage_updated_at=NOW(), updated_at=NOW() WHERE status='processing' AND claimed_at < TIMESTAMPADD(MINUTE,-5,NOW()) AND attempts < 3");
 console.log(`MIGRATION=COMPLETE STUCK_JOBS_REQUEUED=${recovery.affectedRows}`);
 await pool.end();
}
main().catch(async(error)=>{console.error(error.message);try{await pool.end();}catch{}process.exit(1);});