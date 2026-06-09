package com.kanban.service;

import com.kanban.dto.request.CreateIssueRequest;
import com.kanban.dto.response.IssueResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Issue;
import com.kanban.repository.CardRepository;
import com.kanban.repository.IssueRepository;
import com.kanban.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** US-1608: Issue type field — defaults, invalid-type rejection, response mapping. */
@ExtendWith(MockitoExtension.class)
class IssueTypeTest {

    @Mock IssueRepository issueRepository;
    @Mock CardRepository cardRepository;
    @Mock UserRepository userRepository;

    @Mock ReadableIdService readableIdService;
    IssueService issueService;

    private final UUID workspaceId = UUID.randomUUID();

    @BeforeEach void setUp() {
        issueService = new IssueService(issueRepository, cardRepository, userRepository, readableIdService);
        lenient().when(readableIdService.allocate(any(), any())).thenReturn("BUG-001");
    }

    private void stubSave(String type) {
        when(issueRepository.save(any())).thenAnswer(inv -> {
            Issue i = inv.getArgument(0);
            return i;
        });
    }

    @Test void create_issue_without_type_defaults_to_BUG() {
        stubSave("BUG");
        CreateIssueRequest req = new CreateIssueRequest("Title", null, null, null, workspaceId);
        IssueResponse resp = issueService.createIssue(req, UUID.randomUUID());
        assertThat(resp.type()).isEqualTo("BUG");
    }

    @Test void create_issue_with_FEATURE_type_persists_FEATURE() {
        stubSave("FEATURE");
        CreateIssueRequest req = new CreateIssueRequest("Title", null, null, "FEATURE", workspaceId);
        IssueResponse resp = issueService.createIssue(req, UUID.randomUUID());
        assertThat(resp.type()).isEqualTo("FEATURE");
    }

    @Test void create_issue_with_invalid_type_throws_422() {
        CreateIssueRequest req = new CreateIssueRequest("Title", null, null, "INVALID", null);
        assertThatThrownBy(() -> issueService.createIssue(req, UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY));
    }

    @Test void issue_response_includes_type_field() {
        stubSave("STORY");
        CreateIssueRequest req = new CreateIssueRequest("Title", null, null, "STORY", workspaceId);
        IssueResponse resp = issueService.createIssue(req, UUID.randomUUID());
        assertThat(resp.type()).isNotNull();
    }

    @Test void issue_response_includes_readable_id_field() {
        stubSave("BUG");
        CreateIssueRequest req = new CreateIssueRequest("Title", null, null, null, workspaceId);
        IssueResponse resp = issueService.createIssue(req, UUID.randomUUID());
        assertThat(resp).isNotNull();
        // readableId field accessible (value comes from ReadableIdService stub)
        assertThat(resp.readableId()).isNotNull();
    }
}
