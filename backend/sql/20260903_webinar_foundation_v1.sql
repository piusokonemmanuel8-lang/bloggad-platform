-- BLOGGAD WEBINAR FOUNDATION V1
-- MySQL 8+
-- This file defines the same schema for local and live environments.
-- Run it explicitly on each database only after review.

CREATE TABLE IF NOT EXISTS webinars (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  writer_page_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NULL,
  webinar_type ENUM('prerecorded','evergreen','hybrid','live') NOT NULL DEFAULT 'prerecorded',
  visibility ENUM('public','unlisted','private') NOT NULL DEFAULT 'public',
  status ENUM('draft','processing','ready','scheduled','live','ended','archived','error') NOT NULL DEFAULT 'draft',
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  scheduled_start_at DATETIME NULL,
  duration_seconds INT UNSIGNED NULL,
  allow_registration TINYINT(1) NOT NULL DEFAULT 1,
  allow_chat TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinars_user_slug (user_id, slug),
  KEY idx_webinars_user_status (user_id, status),
  KEY idx_webinars_writer_page_status (writer_page_id, status),
  KEY idx_webinars_schedule (scheduled_start_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webinar_media_jobs (
  id BIGINT NOT NULL AUTO_INCREMENT,
  webinar_id BIGINT NOT NULL,
  source_bucket VARCHAR(255) NOT NULL,
  source_key VARCHAR(1024) NOT NULL,
  source_filename VARCHAR(255) NULL,
  source_mime VARCHAR(100) NULL,
  source_size_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('queued','processing','ready','failed','superseded') NOT NULL DEFAULT 'queued',
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  claimed_at DATETIME NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  duration_seconds INT UNSIGNED NULL,
  source_height INT UNSIGNED NULL,
  hls_bucket VARCHAR(255) NULL,
  hls_prefix VARCHAR(1024) NULL,
  hls_master_key VARCHAR(1024) NULL,
  error_message TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webinar_media_webinar (webinar_id, id),
  KEY idx_webinar_media_queue (status, attempts, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webinar_sessions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  webinar_id BIGINT NOT NULL,
  session_key VARCHAR(64) NOT NULL,
  session_type ENUM('scheduled','evergreen','manual') NOT NULL DEFAULT 'scheduled',
  status ENUM('scheduled','open','ended','cancelled') NOT NULL DEFAULT 'scheduled',
  scheduled_start_at DATETIME NULL,
  started_at DATETIME NULL,
  ended_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinar_sessions_key (session_key),
  KEY idx_webinar_sessions_webinar (webinar_id, status, scheduled_start_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webinar_registrations (
  id BIGINT NOT NULL AUTO_INCREMENT,
  webinar_id BIGINT NOT NULL,
  session_id BIGINT NULL,
  user_id BIGINT NULL,
  attendee_name VARCHAR(255) NOT NULL,
  attendee_email VARCHAR(320) NOT NULL,
  source VARCHAR(100) NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webinar_reg_webinar (webinar_id, registered_at),
  KEY idx_webinar_reg_session (session_id, registered_at),
  KEY idx_webinar_reg_email (webinar_id, attendee_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webinar_attendance (
  id BIGINT NOT NULL AUTO_INCREMENT,
  webinar_id BIGINT NOT NULL,
  session_id BIGINT NOT NULL,
  registration_id BIGINT NULL,
  user_id BIGINT NULL,
  visitor_token VARCHAR(64) NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at DATETIME NULL,
  watch_seconds INT UNSIGNED NOT NULL DEFAULT 0,
  completed_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webinar_attendance_webinar (webinar_id, joined_at),
  KEY idx_webinar_attendance_session_live (session_id, left_at, last_seen_at),
  KEY idx_webinar_attendance_registration (registration_id),
  KEY idx_webinar_attendance_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
