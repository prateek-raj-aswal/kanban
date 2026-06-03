package com.kanban.service;

import com.kanban.dto.request.CreateIssueRequest;
import com.kanban.dto.request.UpdateIssueRequest;
import com.kanban.dto.response.IssueResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Card;
import com.kanban.model.Issue;
import com.kanban.model.User;
import com.kanban.repository.CardRepository;
import com.kanban.repository.IssueRepository;
import com.kanban.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class IssueService {

    private static final Set<String> VALID_STATUSES = Set.of("OPEN", "IN_PROGRESS", "CLOSED");

    private final IssueRepository issueRepository;
    private final CardRepository  cardRepository;
    private final UserRepository  userRepository;

    public IssueService(IssueRepository issueRepository,
                        CardRepository cardRepository,
                        UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.cardRepository  = cardRepository;
        this.userRepository  = userRepository;
    }

    @Transactional
    public IssueResponse createIssue(CreateIssueRequest request, UUID requestingUserId) {
        User creator = userRepository.findById(requestingUserId)
                .orElse(null);

        Card parentCard = null;
        if (request.parentCardId() != null) {
            parentCard = cardRepository.findActiveById(request.parentCardId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND",
                            "Parent card not found"));
        }

        Issue issue = new Issue();
        issue.setTitle(request.title());
        issue.setDescription(request.description());
        issue.setStatus("OPEN");
        issue.setParentCard(parentCard);
        issue.setCreatedBy(creator);

        issue = issueRepository.save(issue);
        return toResponse(issue);
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> listIssues(Optional<UUID> parentCardId) {
        List<Issue> issues = parentCardId.isPresent()
                ? issueRepository.findByParentCardId(parentCardId.get())
                : issueRepository.findAll();
        return issues.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public IssueResponse getIssue(UUID issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ISSUE_NOT_FOUND", "Issue not found"));
        return toResponse(issue);
    }

    @Transactional
    public IssueResponse updateIssue(UUID issueId, UpdateIssueRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ISSUE_NOT_FOUND", "Issue not found"));

        if (request.title() != null && !request.title().isBlank()) {
            issue.setTitle(request.title());
        }
        issue.setDescription(request.description());

        if (request.status() != null) {
            if (!VALID_STATUSES.contains(request.status())) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS",
                        "Status must be one of: OPEN, IN_PROGRESS, CLOSED");
            }
            issue.setStatus(request.status());
        }

        // parentCardId: null means detach, UUID means attach
        // We apply parentCardId unconditionally so that PATCH {"parentCardId":null} detaches.
        if (request.parentCardId() != null) {
            Card parentCard = cardRepository.findActiveById(request.parentCardId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND",
                            "Parent card not found"));
            issue.setParentCard(parentCard);
        } else {
            issue.setParentCard(null);
        }

        issue = issueRepository.save(issue);
        return toResponse(issue);
    }

    @Transactional
    public void deleteIssue(UUID issueId) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ISSUE_NOT_FOUND", "Issue not found"));
        issueRepository.delete(issue);
    }

    private IssueResponse toResponse(Issue issue) {
        UUID parentCardId = issue.getParentCard() != null ? issue.getParentCard().getId() : null;
        UUID createdById  = issue.getCreatedBy()  != null ? issue.getCreatedBy().getId()  : null;
        return new IssueResponse(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus(),
                parentCardId,
                createdById,
                issue.getCreatedAt(),
                issue.getUpdatedAt()
        );
    }
}
