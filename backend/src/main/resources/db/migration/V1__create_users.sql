CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID         NOT NULL DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    deleted_at    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users (email) WHERE deleted_at IS NULL;
