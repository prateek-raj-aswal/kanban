package com.kanban.service;

import com.kanban.dto.response.AssigneeResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
import com.kanban.model.Card;
import com.kanban.model.CardAssignee;
import com.kanban.model.User;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.BoardAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardAssigneeServiceTest {

    @Mock CardRepository cardRepository;
    @Mock UserRepository userRepository;
    @Mock CardAssigneeRepository cardAssigneeRepository;
    @Mock BoardAccessPolicy accessPolicy;

    @InjectMocks CardAssigneeService cardAssigneeService;

    private UUID requesterId;
    private UUID boardId;
    private UUID cardId;
    private UUID assigneeUserId;
    private Card card;
    private User user;

    @BeforeEach
    void setUp() {
        requesterId    = UUID.randomUUID();
        boardId        = UUID.randomUUID();
        cardId         = UUID.randomUUID();
        assigneeUserId = UUID.randomUUID();

        Board board = new Board();
        setField(board, "id", boardId);

        BoardColumn column = new BoardColumn();
        setField(column, "id", UUID.randomUUID());
        setField(column, "board", board);

        card = new Card();
        setField(card, "id", cardId);
        setField(card, "column", column);
        setField(card, "title", "Test card");

        user = new User();
        setField(user, "id", assigneeUserId);
        setField(user, "email", "assignee@example.com");
        setField(user, "displayName", "Assignee User");
    }

    // ── listAssignees ─────────────────────────────────────────────────────────

    @Test
    void listAssignees_returnsMappedResponses() {
        CardAssignee ca = new CardAssignee();
        ca.setCardId(cardId);
        ca.setUserId(assigneeUserId);

        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardAssigneeRepository.findByCardId(cardId)).thenReturn(List.of(ca));
        when(userRepository.findAllById(List.of(assigneeUserId))).thenReturn(List.of(user));

        List<AssigneeResponse> result = cardAssigneeService.listAssignees(cardId, requesterId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).userId()).isEqualTo(assigneeUserId);
        assertThat(result.get(0).email()).isEqualTo("assignee@example.com");
        assertThat(result.get(0).displayName()).isEqualTo("Assignee User");
        verify(accessPolicy).assertMember(boardId, requesterId);
    }

    @Test
    void listAssignees_returnsEmptyWhenNoAssignees() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardAssigneeRepository.findByCardId(cardId)).thenReturn(List.of());

        List<AssigneeResponse> result = cardAssigneeService.listAssignees(cardId, requesterId);

        assertThat(result).isEmpty();
    }

    @Test
    void listAssignees_throwsNotFoundWhenCardMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardAssigneeService.listAssignees(cardId, requesterId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    // ── addAssignee ───────────────────────────────────────────────────────────

    @Test
    void addAssignee_savesAndReturnsResponse() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(userRepository.findById(assigneeUserId)).thenReturn(Optional.of(user));
        when(cardAssigneeRepository.existsByCardIdAndUserId(cardId, assigneeUserId)).thenReturn(false);
        when(cardAssigneeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AssigneeResponse result = cardAssigneeService.addAssignee(cardId, assigneeUserId, requesterId);

        assertThat(result.userId()).isEqualTo(assigneeUserId);
        assertThat(result.email()).isEqualTo("assignee@example.com");
        assertThat(result.displayName()).isEqualTo("Assignee User");

        ArgumentCaptor<CardAssignee> captor = ArgumentCaptor.forClass(CardAssignee.class);
        verify(cardAssigneeRepository).save(captor.capture());
        assertThat(captor.getValue().getCardId()).isEqualTo(cardId);
        assertThat(captor.getValue().getUserId()).isEqualTo(assigneeUserId);
        verify(accessPolicy).assertMember(boardId, requesterId);
    }

    @Test
    void addAssignee_throwsConflictIfAlreadyAssigned() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(userRepository.findById(assigneeUserId)).thenReturn(Optional.of(user));
        when(cardAssigneeRepository.existsByCardIdAndUserId(cardId, assigneeUserId)).thenReturn(true);

        assertThatThrownBy(() -> cardAssigneeService.addAssignee(cardId, assigneeUserId, requesterId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    void addAssignee_throwsNotFoundIfCardMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardAssigneeService.addAssignee(cardId, assigneeUserId, requesterId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void addAssignee_throwsNotFoundIfUserMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(userRepository.findById(assigneeUserId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardAssigneeService.addAssignee(cardId, assigneeUserId, requesterId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    // ── removeAssignee ────────────────────────────────────────────────────────

    @Test
    void removeAssignee_deletesAssignment() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardAssigneeRepository.existsByCardIdAndUserId(cardId, assigneeUserId)).thenReturn(true);

        cardAssigneeService.removeAssignee(cardId, assigneeUserId, requesterId);

        verify(cardAssigneeRepository).deleteByCardIdAndUserId(cardId, assigneeUserId);
        verify(accessPolicy).assertMember(boardId, requesterId);
    }

    @Test
    void removeAssignee_throwsNotFoundIfCardMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cardAssigneeService.removeAssignee(cardId, assigneeUserId, requesterId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void removeAssignee_throwsNotFoundIfNotAssigned() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(cardAssigneeRepository.existsByCardIdAndUserId(cardId, assigneeUserId)).thenReturn(false);

        assertThatThrownBy(() -> cardAssigneeService.removeAssignee(cardId, assigneeUserId, requesterId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    private static void setField(Object obj, String field, Object value) {
        try {
            var f = findField(obj.getClass(), field);
            f.setAccessible(true);
            f.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static java.lang.reflect.Field findField(Class<?> clazz, String name) throws NoSuchFieldException {
        try { return clazz.getDeclaredField(name); }
        catch (NoSuchFieldException e) {
            if (clazz.getSuperclass() != null) return findField(clazz.getSuperclass(), name);
            throw e;
        }
    }
}
