-- US-1306: add nullable description column to boards

-- UP
ALTER TABLE boards ADD COLUMN description TEXT;
