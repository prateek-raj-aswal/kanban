package com.kanban.service;

import com.kanban.dto.response.AttachmentResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Attachment;
import com.kanban.model.Card;
import com.kanban.repository.AttachmentRepository;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.CardRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.websocket.BoardEventPayload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AttachmentService {

    private static final long MAX_SIZE_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf", "text/plain", "application/zip"
    );

    @Value("${app.upload-dir:./uploads}")
    private String uploadDir;

    private final AttachmentRepository attachmentRepository;
    private final CardRepository cardRepository;
    private final BoardAccessPolicy accessPolicy;
    private final BoardMemberRepository memberRepository;
    private final EventBroadcastService eventBroadcastService;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             CardRepository cardRepository,
                             BoardAccessPolicy accessPolicy,
                             BoardMemberRepository memberRepository,
                             EventBroadcastService eventBroadcastService) {
        this.attachmentRepository = attachmentRepository;
        this.cardRepository = cardRepository;
        this.accessPolicy = accessPolicy;
        this.memberRepository = memberRepository;
        this.eventBroadcastService = eventBroadcastService;
    }

    @Transactional
    public AttachmentResponse upload(UUID cardId, MultipartFile file, UUID uploaderId) {
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE", "File exceeds 10 MB limit");
        }
        String mimeType = file.getContentType() != null ? file.getContentType() : "";
        if (!mimeType.startsWith("image/") && !ALLOWED_TYPES.contains(mimeType)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "UNSUPPORTED_FILE_TYPE", "File type not allowed");
        }

        Card card = requireCard(cardId);
        UUID boardId = card.getColumn().getBoard().getId();
        accessPolicy.assertMember(boardId, uploaderId);

        String ext = extension(file.getOriginalFilename());
        String storedName = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);

        Path dir = Paths.get(uploadDir);
        try {
            Files.createDirectories(dir);
            Files.copy(file.getInputStream(), dir.resolve(storedName));
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_ERROR", "Failed to store file");
        }

        Attachment attachment = new Attachment();
        attachment.setCard(card);
        attachment.setUploaderId(uploaderId);
        attachment.setOriginalFilename(file.getOriginalFilename() != null ? file.getOriginalFilename() : storedName);
        attachment.setStoredFilename(storedName);
        attachment.setContentType(mimeType);
        attachment.setSizeBytes(file.getSize());
        attachment = attachmentRepository.save(attachment);

        eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("ATTACHMENT_UPLOADED", boardId,
                new BoardEventPayload.AttachmentUploadedData(
                        attachment.getId(), cardId, uploaderId,
                        attachment.getOriginalFilename(),
                        "/api/v1/files/" + storedName,
                        attachment.getSizeBytes(), mimeType, attachment.getCreatedAt())));

        return toResponse(attachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> listAttachments(UUID cardId, UUID requestingUserId) {
        Card card = requireCard(cardId);
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);
        return attachmentRepository.findByCardIdOrderByCreatedAtAsc(cardId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteAttachment(UUID attachmentId, UUID requestingUserId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ATTACHMENT_NOT_FOUND", "Attachment not found"));

        UUID boardId = attachment.getCard().getColumn().getBoard().getId();
        accessPolicy.assertMember(boardId, requestingUserId);

        boolean isUploader = attachment.getUploaderId().equals(requestingUserId);
        boolean isAdmin = memberRepository.findByBoardIdAndUserId(boardId, requestingUserId)
                .map(m -> m.getRole() != null && m.getRole().ordinal() >= com.kanban.security.Role.ADMIN.ordinal())
                .orElse(false);
        boolean isBoardOwner = attachment.getCard().getColumn().getBoard().getOwnerId().equals(requestingUserId);

        if (!isUploader && !isAdmin && !isBoardOwner) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only uploader or board admin can delete attachments");
        }

        try {
            Files.deleteIfExists(Paths.get(uploadDir).resolve(attachment.getStoredFilename()));
        } catch (IOException ignored) {
        }

        UUID cardId = attachment.getCard().getId();
        attachmentRepository.delete(attachment);

        eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("ATTACHMENT_DELETED", boardId,
                new BoardEventPayload.AttachmentDeletedData(attachmentId, cardId)));
    }

    @Transactional(readOnly = true)
    public ResponseEntity<Resource> serveFile(String storedFilename, UUID requestingUserId) {
        Attachment attachment = attachmentRepository.findByStoredFilename(storedFilename)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "File not found"));

        UUID boardId = attachment.getCard().getColumn().getBoard().getId();
        accessPolicy.assertMember(boardId, requestingUserId);

        Path filePath = Paths.get(uploadDir).resolve(storedFilename);
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "File not found on disk");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + attachment.getOriginalFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                .body(resource);
    }

    private AttachmentResponse toResponse(Attachment a) {
        return new AttachmentResponse(
                a.getId(),
                a.getCard().getId(),
                a.getOriginalFilename(),
                "/api/v1/files/" + a.getStoredFilename(),
                a.getContentType(),
                a.getSizeBytes(),
                a.getUploaderId(),
                a.getCreatedAt()
        );
    }

    private Card requireCard(UUID cardId) {
        return cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
    }

    private String extension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot + 1) : "";
    }
}
