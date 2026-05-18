-- V12__card_assignees_and_start_date.sql
-- Stories: US-201, US-202 — Multi-assignee join table; start_date for timeline; drop legacy assignee_id

CREATE TABLE card_assignees (
    card_id     UUID        NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_card_assignees PRIMARY KEY (card_id, user_id)
);

CREATE INDEX idx_card_assignees_card ON card_assignees (card_id);
CREATE INDEX idx_card_assignees_user ON card_assignees (user_id);

ALTER TABLE cards ADD COLUMN start_date DATE;

-- Migrate existing single-assignee rows into the join table
INSERT INTO card_assignees (card_id, user_id)
SELECT id, assignee_id FROM cards WHERE assignee_id IS NOT NULL;

ALTER TABLE cards DROP COLUMN assignee_id;
