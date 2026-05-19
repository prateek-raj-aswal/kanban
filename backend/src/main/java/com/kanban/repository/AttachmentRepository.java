package com.kanban.repository;

import com.kanban.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {

    List<Attachment> findByCardIdOrderByCreatedAtAsc(UUID cardId);

    Optional<Attachment> findByStoredFilename(String storedFilename);
}
