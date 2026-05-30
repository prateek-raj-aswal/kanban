package com.kanban.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "task_assignees")
@IdClass(CardAssigneeId.class)
public class CardAssignee {

    @Id
    @Column(name = "task_id", nullable = false)
    private UUID cardId;

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt = Instant.now();

    public UUID getCardId() { return cardId; }
    public void setCardId(UUID cardId) { this.cardId = cardId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public Instant getAssignedAt() { return assignedAt; }
}
