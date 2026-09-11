-- SEND TO BLOGGAD LIVE DB
-- Adds one adjustment column to the existing users table. Creates no new table.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS writer_follower_adjustment INT NOT NULL DEFAULT 0
  AFTER blogpulse_status;
