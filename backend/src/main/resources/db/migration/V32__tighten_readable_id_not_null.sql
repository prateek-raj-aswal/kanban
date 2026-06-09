-- US-1610: tighten readable_id to NOT NULL on tasks and issues.
-- V31 back-filled all existing rows so this constraint is safe to apply.

ALTER TABLE tasks  ALTER COLUMN readable_id SET NOT NULL;
ALTER TABLE issues ALTER COLUMN readable_id SET NOT NULL;
