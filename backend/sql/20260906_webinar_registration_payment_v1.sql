ALTER TABLE webinars
  ADD COLUMN registration_mode ENUM('free','paid') NOT NULL DEFAULT 'free'
    AFTER allow_chat,
  ADD COLUMN ticket_price_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00
    AFTER registration_mode,
  ADD COLUMN ticket_currency_code CHAR(3) NOT NULL DEFAULT 'USD'
    AFTER ticket_price_usd,
  ADD COLUMN published_at DATETIME NULL
    AFTER ticket_currency_code,
  ADD KEY idx_webinars_publication (published_at, status, visibility);

ALTER TABLE webinar_registrations
  ADD COLUMN registration_token VARCHAR(64) NOT NULL
    AFTER source,
  ADD COLUMN status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'confirmed'
    AFTER registration_token,
  ADD COLUMN payment_status ENUM('not_required','pending','paid','failed','cancelled') NOT NULL DEFAULT 'not_required'
    AFTER status,
  ADD COLUMN confirmed_at DATETIME NULL
    AFTER payment_status,
  ADD UNIQUE KEY uq_webinar_registration_token (registration_token),
  ADD UNIQUE KEY uq_webinar_registration_email (webinar_id, attendee_email),
  ADD KEY idx_webinar_registration_status (webinar_id, status, payment_status);

CREATE TABLE webinar_registration_purchases (
  id BIGINT NOT NULL AUTO_INCREMENT,
  registration_id BIGINT NOT NULL,
  webinar_id BIGINT NOT NULL,
  session_id BIGINT NULL,
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
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinar_registration_purchase_reference (merchant_reference),
  KEY idx_webinar_registration_purchase_registration (registration_id, status, created_at),
  KEY idx_webinar_registration_purchase_webinar (webinar_id, status, created_at),
  KEY idx_webinar_registration_purchase_provider_reference (provider, provider_reference),
  CONSTRAINT fk_webinar_registration_purchase_registration
    FOREIGN KEY (registration_id) REFERENCES webinar_registrations(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_registration_purchase_webinar
    FOREIGN KEY (webinar_id) REFERENCES webinars(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_registration_purchase_session
    FOREIGN KEY (session_id) REFERENCES webinar_sessions(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
