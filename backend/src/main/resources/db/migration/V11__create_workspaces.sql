-- V11__create_workspaces.sql
-- Story: US-101 — Workspace migration: create workspaces table and add workspace_id to boards

-- UP

CREATE TABLE workspaces (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    owner_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_workspaces PRIMARY KEY (id)
);

CREATE INDEX idx_workspaces_owner ON workspaces (owner_id);

CREATE TABLE workspace_members (
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role         VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_workspace_members PRIMARY KEY (workspace_id, user_id),
    CONSTRAINT chk_workspace_members_role CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER'))
);

CREATE INDEX idx_ws_members_workspace ON workspace_members (workspace_id);
CREATE INDEX idx_ws_members_user ON workspace_members (user_id);

ALTER TABLE boards
    ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

CREATE INDEX idx_boards_workspace ON boards (workspace_id) WHERE deleted_at IS NULL;

