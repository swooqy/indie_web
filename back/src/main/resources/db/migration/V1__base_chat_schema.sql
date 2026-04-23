CREATE SCHEMA IF NOT EXISTS chat_db;

CREATE TABLE IF NOT EXISTS chat_db.users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    metadata VARCHAR(1000),
    color_hex VARCHAR(7) NOT NULL DEFAULT '#000000'
);

ALTER TABLE chat_db.users
    ADD CONSTRAINT chk_users_color_hex_format
    CHECK (color_hex ~ '^#[A-Fa-f0-9]{6}$');

CREATE INDEX IF NOT EXISTS idx_users_uuid
    ON chat_db.users (uuid);

CREATE TABLE IF NOT EXISTS chat_db.messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES chat_db.users(id),
    content VARCHAR(1000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_day_utc
    ON chat_db.messages (sender_id, ((created_at AT TIME ZONE 'UTC')::date));