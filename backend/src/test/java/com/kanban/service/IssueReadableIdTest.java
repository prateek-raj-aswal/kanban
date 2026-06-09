package com.kanban.service;

import com.kanban.dto.request.CreateIssueRequest;
import com.kanban.dto.response.IssueResponse;
import com.kanban.model.*;
import com.kanban.repository.CardRepository;
import com.kanban.repository.IssueRepository;
import com.kanban.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** US-1609: IssueService.createIssue workspace resolution and readableId allocation. */
@ExtendWith(MockitoExtension.class)
class IssueReadableIdTest {

    @Mock IssueRepository issueRepository;
    @Mock CardRepository cardRepository;
    @Mock UserRepository userRepository;
    @Mock ReadableIdService readableIdService;

    IssueService issueService;

    private final UUID workspaceId = UUID.randomUUID();

    @BeforeEach void setUp() {
        issueService = new IssueService(issueRepository, cardRepository, userRepository, readableIdService);
    }

    private Card cardInWorkspace(UUID wsId) {
        Board board = new Board();
        board.setWorkspaceId(wsId);
        BoardColumn col = new BoardColumn();
        col.setBoard(board);
        Card card = new Card();
        card.setColumn(col);
        return card;
    }

    @Test void createIssue_with_parentCard_derives_workspace_and_allocates() {
        UUID cardId = UUID.randomUUID();
        Card parentCard = cardInWorkspace(workspaceId);
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(parentCard));
        when(readableIdService.allocate(workspaceId, "BUG")).thenReturn("BUG-001");
        when(issueRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateIssueRequest req = new CreateIssueRequest("Bug", null, cardId, null, null);
        IssueResponse resp = issueService.createIssue(req, UUID.randomUUID());

        assertThat(resp.readableId()).isEqualTo("BUG-001");
        verify(readableIdService).allocate(workspaceId, "BUG");
    }

    @Test void createIssue_standalone_with_workspaceId_in_request_allocates() {
        when(readableIdService.allocate(workspaceId, "BUG")).thenReturn("BUG-007");
        when(issueRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateIssueRequest req = new CreateIssueRequest("Bug", null, null, null, workspaceId);
        IssueResponse resp = issueService.createIssue(req, UUID.randomUUID());

        assertThat(resp.readableId()).isEqualTo("BUG-007");
        verify(readableIdService).allocate(workspaceId, "BUG");
    }

    @Test void createIssue_standalone_without_workspaceId_throws() {
        CreateIssueRequest req = new CreateIssueRequest("Bug", null, null, null, null);
        assertThatThrownBy(() -> issueService.createIssue(req, UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test void createIssue_FEATURE_type_uses_FEAT_prefix() {
        UUID cardId = UUID.randomUUID();
        Card parentCard = cardInWorkspace(workspaceId);
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(parentCard));
        when(readableIdService.allocate(workspaceId, "FEATURE")).thenReturn("FEAT-003");
        when(issueRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateIssueRequest req = new CreateIssueRequest("Feature request", null, cardId, "FEATURE", null);
        IssueResponse resp = issueService.createIssue(req, UUID.randomUUID());

        assertThat(resp.readableId()).isEqualTo("FEAT-003");
    }
}
