CREATE TABLE attachments (
    id                UUID         NOT NULL DEFAULT gen_random_uuid(),
    card_id           UUID         NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    uploader_id       UUID         NOT NULL REFERENCES users(id),
    original_filename VARCHAR(255) NOT NULL,
    stored_filename   VARCHAR(255) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    size_bytes        BIGINT       NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_attachments PRIMARY KEY (id),
    CONSTRAINT uq_attachments_stored UNIQUE (stored_filename)
);
CREATE INDEX idx_attachments_card   ON attachments (card_id);
CREATE INDEX idx_attachments_stored ON attachments (stored_filename);
