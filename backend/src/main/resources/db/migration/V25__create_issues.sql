-- US-1405: issues table (child of tasks/story-cards, standalone allowed)

-- UP
CREATE TABLE issues (
    id             UUID         NOT NULL DEFAULT gen_random_uuid(),
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    status         VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    parent_card_id UUID         REFERENCES tasks(id) ON DELETE SET NULL,
    created_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_issues PRIMARY KEY (id),
    CONSTRAINT chk_issues_status CHECK (status IN ('OPEN','IN_PROGRESS','CLOSED'))
);

CREATE INDEX idx_issues_parent_card ON issues (parent_card_id);
CREATE INDEX idx_issues_status ON issues (status);
