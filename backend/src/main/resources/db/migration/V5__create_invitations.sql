CREATE TABLE board_invitations (
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    board_id      UUID         NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    invited_by    UUID         NOT NULL REFERENCES users(id),
    invitee_email VARCHAR(255) NOT NULL,
    token         VARCHAR(255) NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    expires_at    TIMESTAMPTZ  NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_board_invitations PRIMARY KEY (id),
    CONSTRAINT uq_invitations_token UNIQUE (token)
);

CREATE INDEX idx_invitations_token ON board_invitations (token);
CREATE INDEX idx_invitations_board  ON board_invitations (board_id);
CREATE INDEX idx_invitations_email  ON board_invitations (invitee_email);
