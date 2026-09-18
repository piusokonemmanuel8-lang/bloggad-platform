ALTER TABLE webinar_media_jobs
  ADD COLUMN provider VARCHAR(40) NOT NULL DEFAULT 'local_ffmpeg' AFTER attempts,
  ADD COLUMN provider_job_id VARCHAR(255) NULL AFTER provider,
  ADD KEY idx_webinar_media_provider_job (provider, provider_job_id);

-- Existing local jobs keep local_ffmpeg.
-- New direct-upload jobs are explicitly stored as mediaconvert.