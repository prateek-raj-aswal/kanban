-- US-1604 undo: clear back-filled readable_ids and remove counter rows
UPDATE tasks SET readable_id = NULL;
UPDATE issues SET readable_id = NULL;
DELETE FROM workspace_id_counters;
