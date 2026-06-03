-- US-1311 undo: remove color column from tasks (cards)

-- DOWN
ALTER TABLE tasks DROP COLUMN IF EXISTS color;
