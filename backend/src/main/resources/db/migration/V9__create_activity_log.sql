CREATE TABLE activity_log (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    board_id   UUID        NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    card_id    UUID        REFERENCES cards(id) ON DELETE SET NULL,
    actor_id   UUID        REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    summary    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_activity_log PRIMARY KEY (id)
);

CREATE INDEX idx_activity_board ON activity_log (board_id, created_at DESC);
CREATE INDEX idx_activity_card ON activity_log (card_id, created_at DESC);
