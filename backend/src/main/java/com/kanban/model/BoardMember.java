package com.kanban.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "board_members")
public class BoardMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "board_id", nullable = false)
    private UUID boardId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 20)
    private String role = "MEMBER";

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt = Instant.now();

    public UUID getId() { return id; }
    public UUID getBoardId() { return boardId; }
    public void setBoardId(UUID boardId) { this.boardId = boardId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Instant getJoinedAt() { return joinedAt; }
}
