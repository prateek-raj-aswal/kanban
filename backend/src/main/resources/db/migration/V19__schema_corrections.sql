-- activity_log: add old/new value columns for audit trail
ALTER TABLE activity_log ADD COLUMN old_value TEXT;
ALTER TABLE activity_log ADD COLUMN new_value TEXT;

-- comments: add soft delete support
ALTER TABLE comments ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_comments_deleted ON comments (task_id) WHERE deleted_at IS NULL;

-- labels: add project-scoped label support (nullable — existing rows retain board_id only)
ALTER TABLE labels ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
CREATE INDEX idx_labels_project ON labels (project_id);
