ALTER TABLE webinar_attendance
  ADD UNIQUE KEY uq_webinar_attendance_visitor_token (visitor_token),
  ADD KEY idx_webinar_attendance_session_presence (
    session_id,
    last_seen_at,
    left_at
  ),
  ADD KEY idx_webinar_attendance_registration_session (
    registration_id,
    session_id
  );

CREATE TABLE webinar_chat_messages (
  id BIGINT NOT NULL AUTO_INCREMENT,
  webinar_id BIGINT NOT NULL,
  session_id BIGINT NOT NULL,
  attendance_id BIGINT NULL,
  registration_id BIGINT NULL,
  user_id BIGINT NULL,
  sender_type ENUM('attendee','host','system') NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  message_body VARCHAR(2000) NOT NULL,
  status ENUM('active','hidden','deleted') NOT NULL DEFAULT 'active',
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webinar_chat_session_cursor (session_id, id),
  KEY idx_webinar_chat_webinar_created (webinar_id, created_at),
  KEY idx_webinar_chat_attendance (attendance_id),
  KEY idx_webinar_chat_registration (registration_id),
  KEY idx_webinar_chat_user (user_id),
  KEY idx_webinar_chat_status (session_id, status, id),
  CONSTRAINT fk_webinar_chat_webinar
    FOREIGN KEY (webinar_id) REFERENCES webinars(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_chat_session
    FOREIGN KEY (session_id) REFERENCES webinar_sessions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_chat_attendance
    FOREIGN KEY (attendance_id) REFERENCES webinar_attendance(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_chat_registration
    FOREIGN KEY (registration_id) REFERENCES webinar_registrations(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE webinar_polls (
  id BIGINT NOT NULL AUTO_INCREMENT,
  webinar_id BIGINT NOT NULL,
  session_id BIGINT NULL,
  created_by_user_id BIGINT NOT NULL,
  question VARCHAR(500) NOT NULL,
  status ENUM('draft','open','closed') NOT NULL DEFAULT 'draft',
  opened_at DATETIME NULL,
  closed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webinar_polls_webinar_status (webinar_id, status, id),
  KEY idx_webinar_polls_session_status (session_id, status, id),
  KEY idx_webinar_polls_creator (created_by_user_id),
  CONSTRAINT fk_webinar_polls_webinar
    FOREIGN KEY (webinar_id) REFERENCES webinars(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_polls_session
    FOREIGN KEY (session_id) REFERENCES webinar_sessions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE webinar_poll_options (
  id BIGINT NOT NULL AUTO_INCREMENT,
  poll_id BIGINT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webinar_poll_options_poll_sort (poll_id, sort_order, id),
  CONSTRAINT fk_webinar_poll_options_poll
    FOREIGN KEY (poll_id) REFERENCES webinar_polls(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE webinar_poll_votes (
  id BIGINT NOT NULL AUTO_INCREMENT,
  poll_id BIGINT NOT NULL,
  option_id BIGINT NOT NULL,
  webinar_id BIGINT NOT NULL,
  session_id BIGINT NOT NULL,
  attendance_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_webinar_poll_vote_attendance (poll_id, attendance_id),
  KEY idx_webinar_poll_votes_option (option_id),
  KEY idx_webinar_poll_votes_webinar (webinar_id, poll_id),
  KEY idx_webinar_poll_votes_session (session_id, poll_id),
  CONSTRAINT fk_webinar_poll_votes_poll
    FOREIGN KEY (poll_id) REFERENCES webinar_polls(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_poll_votes_option
    FOREIGN KEY (option_id) REFERENCES webinar_poll_options(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_poll_votes_webinar
    FOREIGN KEY (webinar_id) REFERENCES webinars(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_poll_votes_session
    FOREIGN KEY (session_id) REFERENCES webinar_sessions(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_poll_votes_attendance
    FOREIGN KEY (attendance_id) REFERENCES webinar_attendance(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE webinar_room_events (
  id BIGINT NOT NULL AUTO_INCREMENT,
  webinar_id BIGINT NOT NULL,
  session_id BIGINT NOT NULL,
  event_type VARCHAR(60) NOT NULL,
  entity_id BIGINT NULL,
  payload_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_webinar_room_events_session_cursor (session_id, id),
  KEY idx_webinar_room_events_webinar_cursor (webinar_id, id),
  KEY idx_webinar_room_events_type (session_id, event_type, id),
  CONSTRAINT fk_webinar_room_events_webinar
    FOREIGN KEY (webinar_id) REFERENCES webinars(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_webinar_room_events_session
    FOREIGN KEY (session_id) REFERENCES webinar_sessions(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
