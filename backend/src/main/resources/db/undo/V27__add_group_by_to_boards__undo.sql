-- US-1403 undo: remove group_by column from boards
ALTER TABLE boards DROP CONSTRAINT IF EXISTS chk_boards_group_by;
ALTER TABLE boards DROP COLUMN IF EXISTS group_by;
