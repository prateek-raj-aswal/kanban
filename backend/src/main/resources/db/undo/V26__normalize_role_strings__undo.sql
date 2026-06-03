-- US-1408 undo: restore 3-value workspace constraint; drop board_members constraint.
-- NOTE: VIEWER roles introduced after V26 will become invalid after rollback — manual cleanup required.

-- DOWN
ALTER TABLE workspace_members DROP CONSTRAINT IF EXISTS chk_workspace_members_role;
ALTER TABLE workspace_members ADD CONSTRAINT chk_workspace_members_role
    CHECK (role IN ('OWNER','ADMIN','MEMBER'));

ALTER TABLE board_members DROP CONSTRAINT IF EXISTS chk_board_members_role;
