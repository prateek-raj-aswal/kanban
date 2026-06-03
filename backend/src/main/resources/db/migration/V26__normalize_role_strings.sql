-- US-1408: normalize role strings to OWNER/ADMIN/MEMBER/VIEWER in both
--          board_members and workspace_members; add VIEWER to allowed set.
--          Zero rows lost — unmapped values default to MEMBER.

-- UP

-- board_members: normalise existing free-form strings, then add CHECK
UPDATE board_members SET role = 'OWNER'  WHERE UPPER(role) IN ('OWNER','ADMIN_OWNER');
UPDATE board_members SET role = 'ADMIN'  WHERE UPPER(role) IN ('ADMIN');
UPDATE board_members SET role = 'VIEWER' WHERE UPPER(role) IN ('VIEWER','READ_ONLY','READONLY');
UPDATE board_members SET role = 'MEMBER' WHERE role NOT IN ('OWNER','ADMIN','VIEWER');

ALTER TABLE board_members
    ADD CONSTRAINT chk_board_members_role
    CHECK (role IN ('OWNER','ADMIN','MEMBER','VIEWER'));

-- workspace_members: existing CHECK enforces ('OWNER','ADMIN','MEMBER') so no free-string rows exist.
-- Only the constraint is widened to include VIEWER — no data normalization needed.
ALTER TABLE workspace_members
    DROP CONSTRAINT chk_workspace_members_role;

ALTER TABLE workspace_members
    ADD CONSTRAINT chk_workspace_members_role
    CHECK (role IN ('OWNER','ADMIN','MEMBER','VIEWER'));
