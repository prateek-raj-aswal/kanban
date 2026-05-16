CREATE TABLE notifications (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id    UUID        REFERENCES cards(id) ON DELETE SET NULL,
    board_id   UUID        REFERENCES boards(id) ON DELETE SET NULL,
    type       VARCHAR(50) NOT NULL,
    message    TEXT        NOT NULL,
    read       BOOLEAN     NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_notifications PRIMARY KEY (id)
);

CREATE INDEX idx_notifications_user ON notifications (user_id, read, created_at DESC);
