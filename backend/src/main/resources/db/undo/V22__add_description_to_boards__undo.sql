-- US-1306 undo: remove description column from boards

-- DOWN
ALTER TABLE boards DROP COLUMN IF EXISTS description;
