CREATE TABLE labels (
    id          UUID        NOT NULL DEFAULT gen_random_uuid(),
    board_id    UUID        NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name        VARCHAR(50) NOT NULL,
    color       VARCHAR(7)  NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_labels PRIMARY KEY (id)
);

CREATE INDEX idx_labels_board ON labels (board_id);

CREATE TABLE cards (
    id          UUID             NOT NULL DEFAULT gen_random_uuid(),
    column_id   UUID             NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    title       VARCHAR(255)     NOT NULL,
    description TEXT,
    position    DOUBLE PRECISION NOT NULL,
    assignee_id UUID,
    due_date    DATE,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    CONSTRAINT pk_cards PRIMARY KEY (id)
);

CREATE INDEX idx_cards_column ON cards (column_id) WHERE deleted_at IS NULL;

CREATE TABLE card_labels (
    card_id  UUID NOT NULL REFERENCES cards(id)  ON DELETE CASCADE,
    label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    CONSTRAINT pk_card_labels PRIMARY KEY (card_id, label_id)
);
