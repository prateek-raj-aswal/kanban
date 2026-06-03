package com.kanban.model;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class CardModuleId implements Serializable {
    private UUID card;
    private UUID module;

    public CardModuleId() {}

    public CardModuleId(UUID card, UUID module) {
        this.card = card;
        this.module = module;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CardModuleId that)) return false;
        return Objects.equals(card, that.card) && Objects.equals(module, that.module);
    }

    @Override
    public int hashCode() { return Objects.hash(card, module); }
}
