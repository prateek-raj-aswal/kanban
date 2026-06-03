-- US-1311: add nullable free-form hex color column to tasks (cards)

-- UP
ALTER TABLE tasks ADD COLUMN color VARCHAR(7);
