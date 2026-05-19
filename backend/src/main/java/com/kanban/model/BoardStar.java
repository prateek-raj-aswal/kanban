package com.kanban.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "board_stars")
@IdClass(BoardStarId.class)
public class BoardStar {

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Id
    @Column(name = "board_id", nullable = false)
    private UUID boardId;

    @Column(name = "starred_at", nullable = false, updatable = false)
    private Instant starredAt = Instant.now();

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getBoardId() { return boardId; }
    public void setBoardId(UUID boardId) { this.boardId = boardId; }
    public Instant getStarredAt() { return starredAt; }
}
