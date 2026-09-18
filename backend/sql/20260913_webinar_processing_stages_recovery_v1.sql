ALTER TABLE webinar_media_jobs ADD COLUMN processing_stage VARCHAR(40) NOT NULL DEFAULT 'queued' AFTER status;
ALTER TABLE webinar_media_jobs ADD COLUMN progress_percent TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER processing_stage;
ALTER TABLE webinar_media_jobs ADD COLUMN stage_updated_at DATETIME NULL AFTER progress_percent;