package com.kanban.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "card_modules")
@IdClass(CardModuleId.class)
public class CardModule {

    @Id
    @Column(name = "card_id", nullable = false)
    private UUID card;

    @Id
    @Column(name = "module_id", nullable = false)
    private UUID module;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", insertable = false, updatable = false)
    private Card cardEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", insertable = false, updatable = false)
    private Module moduleEntity;

    public UUID getCard() { return card; }
    public void setCard(UUID card) { this.card = card; }
    public UUID getModule() { return module; }
    public void setModule(UUID module) { this.module = module; }
    public Card getCardEntity() { return cardEntity; }
    public Module getModuleEntity() { return moduleEntity; }
}
