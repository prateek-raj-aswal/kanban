CREATE TABLE projects (
    id           UUID         NOT NULL DEFAULT gen_random_uuid(),
    workspace_id UUID         NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    key          VARCHAR(10)  NOT NULL,
    description  TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ,
    CONSTRAINT pk_projects PRIMARY KEY (id),
    CONSTRAINT uq_projects_workspace_key UNIQUE (workspace_id, key)
);

CREATE INDEX idx_projects_workspace ON projects (workspace_id) WHERE deleted_at IS NULL;
