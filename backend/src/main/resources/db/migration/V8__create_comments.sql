CREATE TABLE comments (
    id         UUID        NOT NULL DEFAULT gen_random_uuid(),
    card_id    UUID        NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    author_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_comments PRIMARY KEY (id)
);

CREATE INDEX idx_comments_card ON comments (card_id);
