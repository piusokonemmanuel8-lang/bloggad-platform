ALTER TABLE webinar_subscription_plans
  ADD COLUMN max_concurrent_attendees INT UNSIGNED NULL
    AFTER max_webinars,
  ADD COLUMN monthly_playback_seconds_limit BIGINT UNSIGNED NULL
    AFTER max_concurrent_attendees,
  ADD COLUMN ticket_platform_fee_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00
    AFTER max_video_duration_seconds;

CREATE TABLE webinar_waiting_room_entries (
  id BIGINT NOT NULL AUTO_INCREMENT,
  writer_user_id BIGINT NOT NULL,
  webinar_id BIGINT NOT NULL,
  session_id BIGINT NOT NULL,
  registration_id BIGINT NOT NULL,
  status ENUM('waiting','admitted','cancelled') NOT NULL DEFAULT 'waiting',
  queued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  admitted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinar_waiting_registration_session (
    registration_id,
    session_id
  ),
  KEY idx_webinar_waiting_writer_status_queue (
    writer_user_id,
    status,
    queued_at,
    id
  ),
  KEY idx_webinar_waiting_session_status (
    session_id,
    status,
    queued_at,
    id
  ),
  KEY idx_webinar_waiting_webinar_status (
    webinar_id,
    status,
    queued_at,
    id
  ),
  CONSTRAINT fk_webinar_waiting_webinar
    FOREIGN KEY (webinar_id) REFERENCES webinars(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_waiting_session
    FOREIGN KEY (session_id) REFERENCES webinar_sessions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_waiting_registration
    FOREIGN KEY (registration_id) REFERENCES webinar_registrations(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO webinar_subscription_plans (
  plan_key,
  name,
  price_usd,
  billing_cycle,
  bandwidth_limit_bytes,
  storage_limit_bytes,
  max_webinars,
  max_concurrent_attendees,
  monthly_playback_seconds_limit,
  max_video_duration_seconds,
  ticket_platform_fee_percent,
  features_json,
  status,
  sort_order,
  created_at,
  updated_at
)
VALUES
(
  'starter_monthly',
  'Starter',
  9.00,
  'monthly',
  NULL,
  10737418240,
  NULL,
  100,
  1080000,
  3600,
  10.00,
  '{"unlimited_webinars":true,"unlimited_registrations":true,"waiting_room":true,"capacity_scope":"writer_account","monthly_attendee_hours":300}',
  'active',
  10,
  NOW(),
  NOW()
),
(
  'starter_yearly',
  'Starter',
  90.00,
  'yearly',
  NULL,
  10737418240,
  NULL,
  100,
  1080000,
  3600,
  10.00,
  '{"unlimited_webinars":true,"unlimited_registrations":true,"waiting_room":true,"capacity_scope":"writer_account","monthly_attendee_hours":300}',
  'active',
  11,
  NOW(),
  NOW()
),
(
  'pro_monthly',
  'Pro',
  29.00,
  'monthly',
  NULL,
  53687091200,
  NULL,
  500,
  7200000,
  7200,
  7.00,
  '{"unlimited_webinars":true,"unlimited_registrations":true,"waiting_room":true,"capacity_scope":"writer_account","monthly_attendee_hours":2000}',
  'active',
  20,
  NOW(),
  NOW()
),
(
  'pro_yearly',
  'Pro',
  290.00,
  'yearly',
  NULL,
  53687091200,
  NULL,
  500,
  7200000,
  7200,
  7.00,
  '{"unlimited_webinars":true,"unlimited_registrations":true,"waiting_room":true,"capacity_scope":"writer_account","monthly_attendee_hours":2000}',
  'active',
  21,
  NOW(),
  NOW()
),
(
  'business_monthly',
  'Business',
  79.00,
  'monthly',
  NULL,
  161061273600,
  NULL,
  1000,
  21600000,
  10800,
  5.00,
  '{"unlimited_webinars":true,"unlimited_registrations":true,"waiting_room":true,"capacity_scope":"writer_account","monthly_attendee_hours":6000}',
  'active',
  30,
  NOW(),
  NOW()
),
(
  'business_yearly',
  'Business',
  790.00,
  'yearly',
  NULL,
  161061273600,
  NULL,
  1000,
  21600000,
  10800,
  5.00,
  '{"unlimited_webinars":true,"unlimited_registrations":true,"waiting_room":true,"capacity_scope":"writer_account","monthly_attendee_hours":6000}',
  'active',
  31,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  price_usd = VALUES(price_usd),
  billing_cycle = VALUES(billing_cycle),
  bandwidth_limit_bytes = VALUES(bandwidth_limit_bytes),
  storage_limit_bytes = VALUES(storage_limit_bytes),
  max_webinars = VALUES(max_webinars),
  max_concurrent_attendees = VALUES(max_concurrent_attendees),
  monthly_playback_seconds_limit =
    VALUES(monthly_playback_seconds_limit),
  max_video_duration_seconds =
    VALUES(max_video_duration_seconds),
  ticket_platform_fee_percent =
    VALUES(ticket_platform_fee_percent),
  features_json = VALUES(features_json),
  status = VALUES(status),
  sort_order = VALUES(sort_order),
  updated_at = NOW();
