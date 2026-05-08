package com.kanban.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id", nullable = false)
    private BoardColumn column;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private double position;

    @Column(name = "assignee_id")
    private UUID assigneeId;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "card_labels",
        joinColumns = @JoinColumn(name = "card_id"),
        inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    private List<Label> labels = new ArrayList<>();

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public BoardColumn getColumn() { return column; }
    public void setColumn(BoardColumn column) { this.column = column; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPosition() { return position; }
    public void setPosition(double position) { this.position = position; }
    public UUID getAssigneeId() { return assigneeId; }
    public void setAssigneeId(UUID assigneeId) { this.assigneeId = assigneeId; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public List<Label> getLabels() { return labels; }
}
