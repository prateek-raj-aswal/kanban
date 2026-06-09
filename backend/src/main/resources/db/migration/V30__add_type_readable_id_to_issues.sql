-- US-1603: type classification and readable ID columns on issues

ALTER TABLE issues ADD COLUMN type        VARCHAR(10) NOT NULL DEFAULT 'BUG';
ALTER TABLE issues ADD COLUMN readable_id VARCHAR(20);

ALTER TABLE issues ADD CONSTRAINT chk_issues_type CHECK (type IN ('STORY', 'FEATURE', 'BUG'));
