package com.kanban.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class BoardStarId implements Serializable {

    private UUID userId;
    private UUID boardId;

    public BoardStarId() {}

    public BoardStarId(UUID userId, UUID boardId) {
        this.userId = userId;
        this.boardId = boardId;
    }

    public UUID getUserId() { return userId; }
    public UUID getBoardId() { return boardId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BoardStarId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(boardId, that.boardId);
    }

    @Override
    public int hashCode() { return Objects.hash(userId, boardId); }
}
