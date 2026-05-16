CREATE TABLE subtasks (
    id         UUID             NOT NULL DEFAULT gen_random_uuid(),
    card_id    UUID             NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    title      VARCHAR(255)     NOT NULL,
    completed  BOOLEAN          NOT NULL DEFAULT false,
    position   DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),
    CONSTRAINT pk_subtasks PRIMARY KEY (id)
);

CREATE INDEX idx_subtasks_card ON subtasks (card_id);
