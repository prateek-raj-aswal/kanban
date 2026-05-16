package com.kanban.service;

import com.kanban.dto.request.CreateCommentRequest;
import com.kanban.dto.request.UpdateCommentRequest;
import com.kanban.dto.response.CommentResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Card;
import com.kanban.model.Comment;
import com.kanban.model.User;
import com.kanban.repository.CardRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.BoardAccessPolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private static final Pattern MENTION_PATTERN = Pattern.compile("@(\\S+)");

    private final CommentRepository commentRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final BoardAccessPolicy accessPolicy;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository, CardRepository cardRepository,
                          UserRepository userRepository, BoardAccessPolicy accessPolicy,
                          NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.accessPolicy = accessPolicy;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(UUID cardId, UUID requestingUserId) {
        Card card = requireCard(cardId);
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), requestingUserId);
        List<Comment> comments = commentRepository.findByCardIdOrderByCreatedAtAsc(cardId);
        Set<UUID> authorIds = comments.stream().map(Comment::getAuthorId).collect(Collectors.toSet());
        Map<UUID, String> names = userRepository.findAllById(authorIds)
                .stream().collect(Collectors.toMap(User::getId, User::getDisplayName));
        return comments.stream()
                .map(c -> toResponse(c, names.getOrDefault(c.getAuthorId(), "Unknown")))
                .toList();
    }

    @Transactional
    public CommentResponse createComment(UUID cardId, CreateCommentRequest request, UUID authorId) {
        Card card = requireCard(cardId);
        accessPolicy.assertMember(card.getColumn().getBoard().getId(), authorId);
        Comment c = new Comment();
        c.setCard(card);
        c.setAuthorId(authorId);
        c.setBody(request.body());
        c = commentRepository.save(c);
        String authorName = userRepository.findById(authorId).map(User::getDisplayName).orElse("Unknown");
        UUID boardId = card.getColumn().getBoard().getId();
        processMentions(request.body(), authorId, authorName, card.getId(), boardId);
        return toResponse(c, authorName);
    }

    @Transactional
    public CommentResponse updateComment(UUID commentId, UpdateCommentRequest request, UUID requestingUserId) {
        Comment c = requireComment(commentId);
        if (!c.getAuthorId().equals(requestingUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You can only edit your own comments");
        }
        c.setBody(request.body());
        c = commentRepository.save(c);
        String name = userRepository.findById(c.getAuthorId()).map(User::getDisplayName).orElse("Unknown");
        return toResponse(c, name);
    }

    @Transactional
    public void deleteComment(UUID commentId, UUID requestingUserId) {
        Comment c = requireComment(commentId);
        if (!c.getAuthorId().equals(requestingUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "You can only delete your own comments");
        }
        commentRepository.delete(c);
    }

    private void processMentions(String body, UUID authorId, String authorName, UUID cardId, UUID boardId) {
        Matcher m = MENTION_PATTERN.matcher(body);
        Set<String> seen = new java.util.HashSet<>();
        while (m.find()) {
            String displayName = m.group(1);
            if (seen.add(displayName)) {
                userRepository.findAll().stream()
                        .filter(u -> u.getDisplayName().equalsIgnoreCase(displayName)
                                && !u.getId().equals(authorId))
                        .findFirst()
                        .ifPresent(u -> notificationService.notifyMention(
                                u.getId(), cardId, boardId, authorName));
            }
        }
    }

    private Card requireCard(UUID cardId) {
        return cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
    }

    private Comment requireComment(UUID commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COMMENT_NOT_FOUND", "Comment not found"));
    }

    private CommentResponse toResponse(Comment c, String authorName) {
        return new CommentResponse(c.getId(), c.getCard().getId(), c.getAuthorId(),
                authorName, c.getBody(), c.getCreatedAt(), c.getUpdatedAt());
    }
}
