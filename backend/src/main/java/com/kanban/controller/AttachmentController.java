package com.kanban.controller;

import com.kanban.dto.response.AttachmentResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.AttachmentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/api/v1/cards/{cardId}/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    public AttachmentResponse uploadAttachment(@PathVariable UUID cardId,
                                               @RequestParam("file") MultipartFile file,
                                               @AuthenticationPrincipal AuthenticatedUser principal) {
        return attachmentService.upload(cardId, file, principal.id());
    }

    @GetMapping("/api/v1/cards/{cardId}/attachments")
    public List<AttachmentResponse> listAttachments(@PathVariable UUID cardId,
                                                     @AuthenticationPrincipal AuthenticatedUser principal) {
        return attachmentService.listAttachments(cardId, principal.id());
    }

    @DeleteMapping("/api/v1/attachments/{attachmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAttachment(@PathVariable UUID attachmentId,
                                 @AuthenticationPrincipal AuthenticatedUser principal) {
        attachmentService.deleteAttachment(attachmentId, principal.id());
    }

    @GetMapping("/api/v1/files/{filename}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename,
                                              @AuthenticationPrincipal AuthenticatedUser principal) {
        return attachmentService.serveFile(filename, principal.id());
    }
}
