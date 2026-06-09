package com.kanban.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "workspace_id_counters")
@IdClass(WorkspaceIdCounterId.class)
public class WorkspaceIdCounter {

    @Id
    @Column(name = "workspace_id", nullable = false)
    private UUID workspaceId;

    @Id
    @Column(name = "item_type", nullable = false, length = 10)
    private String itemType;

    @Column(name = "last_counter", nullable = false)
    private int lastCounter = 0;

    public UUID getWorkspaceId() { return workspaceId; }
    public void setWorkspaceId(UUID workspaceId) { this.workspaceId = workspaceId; }
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    public int getLastCounter() { return lastCounter; }
    public void setLastCounter(int lastCounter) { this.lastCounter = lastCounter; }
}
