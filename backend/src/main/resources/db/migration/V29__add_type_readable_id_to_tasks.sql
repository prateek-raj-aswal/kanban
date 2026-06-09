-- US-1602: type classification and readable ID columns on tasks

ALTER TABLE tasks ADD COLUMN type        VARCHAR(10) NOT NULL DEFAULT 'STORY';
ALTER TABLE tasks ADD COLUMN readable_id VARCHAR(20);

ALTER TABLE tasks ADD CONSTRAINT chk_tasks_type CHECK (type IN ('STORY', 'FEATURE', 'BUG'));
