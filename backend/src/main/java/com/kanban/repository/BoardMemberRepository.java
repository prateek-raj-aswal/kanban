package com.kanban.repository;

import com.kanban.model.BoardMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardMemberRepository extends JpaRepository<BoardMember, UUID> {

    Optional<BoardMember> findByBoardIdAndUserId(UUID boardId, UUID userId);

    List<BoardMember> findAllByBoardId(UUID boardId);

    @Query("SELECT COUNT(bm) > 0 FROM BoardMember bm WHERE bm.boardId = :boardId AND bm.userId = :userId")
    boolean existsByBoardIdAndUserId(UUID boardId, UUID userId);
}
