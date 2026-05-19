CREATE TABLE board_stars (
    user_id    UUID        NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    board_id   UUID        NOT NULL REFERENCES boards(id)  ON DELETE CASCADE,
    starred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT pk_board_stars PRIMARY KEY (user_id, board_id)
);
CREATE INDEX idx_board_stars_user ON board_stars (user_id, starred_at DESC);
