-- US-1601: counter store for readable ID allocation per workspace + item type
-- SELECT FOR UPDATE on a row here serialises concurrent ID allocations

CREATE TABLE workspace_id_counters (
    workspace_id UUID        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    item_type    VARCHAR(10) NOT NULL,
    last_counter INTEGER     NOT NULL DEFAULT 0,
    CONSTRAINT pk_workspace_id_counters PRIMARY KEY (workspace_id, item_type)
);
