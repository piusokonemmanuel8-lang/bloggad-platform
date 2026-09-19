-- BLOGGAD WRITER POST COMMENT CONTROL V1
-- Existing posts remain comment-enabled by default.

SET @comments_enabled_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'product_posts'
    AND COLUMN_NAME = 'comments_enabled'
);

SET @comments_enabled_sql := IF(
  @comments_enabled_exists = 0,
  'ALTER TABLE product_posts ADD COLUMN comments_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER status',
  'SELECT 1'
);

PREPARE comments_enabled_stmt FROM @comments_enabled_sql;
EXECUTE comments_enabled_stmt;
DEALLOCATE PREPARE comments_enabled_stmt;
