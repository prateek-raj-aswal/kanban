-- Undo V32: restore readable_id to nullable on tasks and issues.

ALTER TABLE tasks  ALTER COLUMN readable_id DROP NOT NULL;
ALTER TABLE issues ALTER COLUMN readable_id DROP NOT NULL;
