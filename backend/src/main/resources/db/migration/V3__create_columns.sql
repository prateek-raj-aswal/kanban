CREATE TABLE columns (
    id         UUID              NOT NULL DEFAULT gen_random_uuid(),
    board_id   UUID              NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name       VARCHAR(100)      NOT NULL,
    position   DOUBLE PRECISION  NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ       NOT NULL DEFAULT now(),
    CONSTRAINT pk_columns PRIMARY KEY (id)
);

CREATE INDEX idx_columns_board_position ON columns (board_id, position) WHERE deleted_at IS NULL;
