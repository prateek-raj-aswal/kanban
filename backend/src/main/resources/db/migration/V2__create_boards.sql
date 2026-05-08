CREATE TABLE boards (
    id         UUID         NOT NULL DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    owner_id   UUID         NOT NULL REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_boards PRIMARY KEY (id)
);

CREATE INDEX idx_boards_owner ON boards (owner_id) WHERE deleted_at IS NULL;

CREATE TABLE board_members (
    id        UUID         NOT NULL DEFAULT gen_random_uuid(),
    board_id  UUID         NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id   UUID         NOT NULL REFERENCES users(id),
    role      VARCHAR(20)  NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_board_members PRIMARY KEY (id),
    CONSTRAINT uq_board_members_board_user UNIQUE (board_id, user_id)
);

CREATE INDEX idx_board_members_board ON board_members (board_id);
CREATE INDEX idx_board_members_user ON board_members (user_id);
