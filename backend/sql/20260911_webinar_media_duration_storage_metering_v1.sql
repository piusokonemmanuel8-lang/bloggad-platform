ALTER TABLE webinar_media_jobs
  ADD COLUMN source_storage_accounted_at DATETIME NULL
    AFTER source_size_bytes,
  ADD COLUMN source_deleted_at DATETIME NULL
    AFTER source_storage_accounted_at,
  ADD COLUMN hls_size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0
    AFTER hls_master_key,
  ADD COLUMN hls_storage_accounted_at DATETIME NULL
    AFTER hls_size_bytes,
  ADD COLUMN hls_deleted_at DATETIME NULL
    AFTER hls_storage_accounted_at,
  ADD KEY idx_webinar_media_source_accounting (
    source_storage_accounted_at,
    source_deleted_at,
    status,
    id
  ),
  ADD KEY idx_webinar_media_hls_accounting (
    hls_storage_accounted_at,
    hls_deleted_at,
    status,
    id
  );
