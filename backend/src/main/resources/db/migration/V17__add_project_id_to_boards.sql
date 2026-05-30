ALTER TABLE boards
    ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

CREATE INDEX idx_boards_project ON boards (project_id) WHERE deleted_at IS NULL;
