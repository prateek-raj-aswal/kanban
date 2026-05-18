package com.kanban.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CardAssigneeId implements Serializable {
    private UUID cardId;
    private UUID userId;

    public CardAssigneeId() {}

    public CardAssigneeId(UUID cardId, UUID userId) {
        this.cardId = cardId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CardAssigneeId that)) return false;
        return Objects.equals(cardId, that.cardId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() { return Objects.hash(cardId, userId); }
}
