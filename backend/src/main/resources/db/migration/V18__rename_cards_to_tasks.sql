-- Add created_by before rename so FK is established on the correct table
ALTER TABLE cards
    ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Rename primary table
ALTER TABLE cards RENAME TO tasks;

-- Rename join tables and their FK columns
ALTER TABLE card_labels RENAME TO task_labels;
ALTER TABLE task_labels RENAME COLUMN card_id TO task_id;

ALTER TABLE card_assignees RENAME TO task_assignees;
ALTER TABLE task_assignees RENAME COLUMN card_id TO task_id;

-- Rename card_id FK columns in dependent tables
ALTER TABLE comments       RENAME COLUMN card_id TO task_id;
ALTER TABLE activity_log   RENAME COLUMN card_id TO task_id;
ALTER TABLE subtasks       RENAME COLUMN card_id TO task_id;
ALTER TABLE attachments    RENAME COLUMN card_id TO task_id;
ALTER TABLE notifications  RENAME COLUMN card_id TO task_id;

-- Replace stale card_assignees indexes with correctly-named equivalents
DROP INDEX IF EXISTS idx_card_assignees_card;
DROP INDEX IF EXISTS idx_card_assignees_user;

CREATE INDEX idx_task_labels_task    ON task_labels    (task_id);
CREATE INDEX idx_task_assignees_task ON task_assignees (task_id);
CREATE INDEX idx_task_assignees_user ON task_assignees (user_id);
