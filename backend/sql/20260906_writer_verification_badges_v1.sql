CREATE TABLE IF NOT EXISTS writer_identity_verifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  writer_user_id BIGINT UNSIGNED NOT NULL,
  badge_type ENUM('gold','official') NOT NULL,
  entity_type ENUM('company','brand','institution','newsroom','government','nonprofit','platform') NOT NULL,
  legal_name VARCHAR(190) NULL,
  public_name VARCHAR(190) NOT NULL,
  status ENUM('pending','approved','rejected','revoked') NOT NULL DEFAULT 'pending',
  review_note VARCHAR(500) NULL,
  reviewed_by_user_id BIGINT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  issued_at DATETIME NULL,
  revoked_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_writer_identity_verifications_writer (writer_user_id),
  KEY idx_writer_identity_verifications_status_badge (status, badge_type),
  KEY idx_writer_identity_verifications_reviewer (reviewed_by_user_id),
  CONSTRAINT fk_writer_identity_verifications_writer
    FOREIGN KEY (writer_user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_writer_identity_verifications_reviewer
    FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
