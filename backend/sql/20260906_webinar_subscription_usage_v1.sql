CREATE TABLE IF NOT EXISTS webinar_subscription_plans (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  plan_key VARCHAR(80) NOT NULL,
  name VARCHAR(120) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  billing_cycle ENUM('monthly','yearly') NOT NULL DEFAULT 'monthly',
  bandwidth_limit_bytes BIGINT UNSIGNED NULL,
  storage_limit_bytes BIGINT UNSIGNED NULL,
  max_webinars INT UNSIGNED NULL,
  max_video_duration_seconds INT UNSIGNED NULL,
  features_json LONGTEXT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'inactive',
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinar_subscription_plans_key (plan_key),
  KEY idx_webinar_subscription_plans_status_sort (status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webinar_subscription_purchases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  writer_user_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(40) NOT NULL,
  gateway_mode ENUM('test','live') NOT NULL,
  merchant_reference VARCHAR(120) NOT NULL,
  provider_reference VARCHAR(150) NULL,
  provider_transaction_id VARCHAR(150) NULL,
  expected_amount_usd DECIMAL(10,2) NOT NULL,
  currency_code CHAR(3) NOT NULL DEFAULT 'USD',
  status ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  checkout_url TEXT NULL,
  gateway_response_json LONGTEXT NULL,
  failure_reason VARCHAR(500) NULL,
  subscription_id BIGINT UNSIGNED NULL,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinar_subscription_purchase_reference (merchant_reference),
  KEY idx_webinar_subscription_purchase_writer_status (writer_user_id, status, created_at),
  KEY idx_webinar_subscription_purchase_plan (plan_id),
  KEY idx_webinar_subscription_purchase_provider_reference (provider, provider_reference),
  KEY idx_webinar_subscription_purchase_subscription (subscription_id),
  CONSTRAINT fk_webinar_subscription_purchase_writer
    FOREIGN KEY (writer_user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_subscription_purchase_plan
    FOREIGN KEY (plan_id) REFERENCES webinar_subscription_plans(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webinar_subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  writer_user_id BIGINT UNSIGNED NOT NULL,
  plan_id BIGINT UNSIGNED NOT NULL,
  purchase_id BIGINT UNSIGNED NULL,
  status ENUM('active','expired','cancelled','suspended') NOT NULL DEFAULT 'active',
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  amount_paid_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  provider VARCHAR(40) NULL,
  provider_reference VARCHAR(150) NULL,
  cancelled_at DATETIME NULL,
  suspended_reason VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webinar_subscriptions_writer_status (writer_user_id, status, current_period_end),
  KEY idx_webinar_subscriptions_plan (plan_id),
  KEY idx_webinar_subscriptions_purchase (purchase_id),
  CONSTRAINT fk_webinar_subscriptions_writer
    FOREIGN KEY (writer_user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_subscriptions_plan
    FOREIGN KEY (plan_id) REFERENCES webinar_subscription_plans(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_subscriptions_purchase
    FOREIGN KEY (purchase_id) REFERENCES webinar_subscription_purchases(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE webinar_subscription_purchases
  ADD CONSTRAINT fk_webinar_subscription_purchase_subscription
  FOREIGN KEY (subscription_id) REFERENCES webinar_subscriptions(id)
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS webinar_usage_periods (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  subscription_id BIGINT UNSIGNED NOT NULL,
  writer_user_id BIGINT UNSIGNED NOT NULL,
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  bandwidth_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  storage_bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
  playback_seconds BIGINT UNSIGNED NOT NULL DEFAULT 0,
  viewer_sessions BIGINT UNSIGNED NOT NULL DEFAULT 0,
  bandwidth_limit_reached_at DATETIME NULL,
  storage_limit_reached_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinar_usage_period_subscription_start (subscription_id, period_start),
  KEY idx_webinar_usage_period_writer_end (writer_user_id, period_end),
  CONSTRAINT fk_webinar_usage_period_subscription
    FOREIGN KEY (subscription_id) REFERENCES webinar_subscriptions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_usage_period_writer
    FOREIGN KEY (writer_user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webinar_usage_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  usage_period_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED NOT NULL,
  writer_user_id BIGINT UNSIGNED NOT NULL,
  usage_key VARCHAR(190) NOT NULL,
  event_type ENUM('bandwidth','storage','playback','session','mixed') NOT NULL DEFAULT 'mixed',
  bandwidth_bytes_delta BIGINT UNSIGNED NOT NULL DEFAULT 0,
  storage_bytes_delta BIGINT NOT NULL DEFAULT 0,
  playback_seconds_delta BIGINT UNSIGNED NOT NULL DEFAULT 0,
  viewer_sessions_delta BIGINT UNSIGNED NOT NULL DEFAULT 0,
  metadata_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinar_usage_event_key (usage_key),
  KEY idx_webinar_usage_event_period_created (usage_period_id, created_at),
  KEY idx_webinar_usage_event_writer_created (writer_user_id, created_at),
  CONSTRAINT fk_webinar_usage_event_period
    FOREIGN KEY (usage_period_id) REFERENCES webinar_usage_periods(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_usage_event_subscription
    FOREIGN KEY (subscription_id) REFERENCES webinar_subscriptions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_usage_event_writer
    FOREIGN KEY (writer_user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
