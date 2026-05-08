package com.kanban.repository;

import com.kanban.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardRepository extends JpaRepository<Board, UUID> {

    @Query("SELECT b FROM Board b WHERE b.id = :id AND b.deletedAt IS NULL")
    Optional<Board> findActiveById(UUID id);

    @Query("""
        SELECT b FROM Board b
        JOIN BoardMember bm ON bm.boardId = b.id
        WHERE bm.userId = :userId AND b.deletedAt IS NULL
        """)
    List<Board> findAllActiveByMember(UUID userId);
}
