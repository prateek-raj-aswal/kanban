-- US-1401: board-scoped modules/tags + card_modules join table

-- UP
CREATE TABLE modules (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    board_id   UUID         NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_modules PRIMARY KEY (id)
);

CREATE INDEX idx_modules_board_id ON modules (board_id);

CREATE TABLE card_modules (
    card_id   UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    CONSTRAINT pk_card_modules PRIMARY KEY (card_id, module_id)
);

CREATE INDEX idx_card_modules_module_id ON card_modules (module_id);
