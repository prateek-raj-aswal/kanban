-- US-1403: persist swimlane group-by configuration per board
-- Allowed values: NONE (default), ASSIGNEE, PRIORITY, MODULE

ALTER TABLE boards ADD COLUMN group_by VARCHAR(20) NOT NULL DEFAULT 'NONE';
ALTER TABLE boards ADD CONSTRAINT chk_boards_group_by CHECK (group_by IN ('NONE','ASSIGNEE','PRIORITY','MODULE'));
