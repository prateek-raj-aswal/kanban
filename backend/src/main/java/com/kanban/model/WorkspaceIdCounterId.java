package com.kanban.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class WorkspaceIdCounterId implements Serializable {

    private UUID workspaceId;
    private String itemType;

    public WorkspaceIdCounterId() {}

    public WorkspaceIdCounterId(UUID workspaceId, String itemType) {
        this.workspaceId = workspaceId;
        this.itemType = itemType;
    }

    public UUID getWorkspaceId() { return workspaceId; }
    public String getItemType() { return itemType; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof WorkspaceIdCounterId that)) return false;
        return Objects.equals(workspaceId, that.workspaceId) && Objects.equals(itemType, that.itemType);
    }

    @Override
    public int hashCode() { return Objects.hash(workspaceId, itemType); }
}
