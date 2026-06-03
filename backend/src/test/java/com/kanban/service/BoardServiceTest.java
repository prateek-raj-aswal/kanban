package com.kanban.service;

import com.kanban.dto.request.UpdateBoardRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardMember;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardModuleRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.security.Role;
import com.kanban.repository.BoardRepository;
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

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock BoardRepository boardRepository;
    @Mock BoardMemberRepository memberRepository;
    @Mock UserRepository userRepository;
    @Mock BoardAccessPolicy accessPolicy;
    @Mock SubtaskRepository subtaskRepository;
    @Mock CommentRepository commentRepository;
    @Mock CardAssigneeRepository cardAssigneeRepository;
    @Mock CardModuleRepository cardModuleRepository;
    @Mock CardRepository cardRepository;
    @Mock WorkspaceMemberRepository workspaceMemberRepository;

    @InjectMocks BoardService boardService;

    private UUID userId;
    private UUID boardId;
    private Board board;
    private BoardMember boardMember;

    @BeforeEach
    void setUp() {
        userId  = UUID.randomUUID();
        boardId = UUID.randomUUID();

        board = new Board();
        setField(board, "id", boardId);
        board.setName("Original Name");
        board.setOwnerId(userId);

        boardMember = new BoardMember();
        boardMember.setBoardId(boardId);
        boardMember.setUserId(userId);
        boardMember.setRole(Role.OWNER);
    }

    @Test
    void updateBoard_updatesNameAndReturnsBoardResponse() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(boardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));

        UpdateBoardRequest req = new UpdateBoardRequest("New Name", null, null);
        BoardResponse res = boardService.updateBoard(boardId, req, userId);

        assertThat(res.name()).isEqualTo("New Name");
        assertThat(res.id()).isEqualTo(boardId);
        assertThat(res.role()).isEqualTo("OWNER");

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("New Name");
    }

    @Test
    void updateBoard_assertsMembership() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(boardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));

        boardService.updateBoard(boardId, new UpdateBoardRequest("X", null, null), userId);

        verify(accessPolicy).assertMember(boardId, userId);
    }

    @Test
    void updateBoard_throwsNotFoundWhenBoardMissing() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            boardService.updateBoard(boardId, new UpdateBoardRequest("X", null, null), userId)
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);

        verify(boardRepository, never()).save(any());
    }

    @Test
    void updateBoard_throwsForbiddenWhenNotMember() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        doThrow(new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied"))
            .when(accessPolicy).assertMember(boardId, userId);

        assertThatThrownBy(() ->
            boardService.updateBoard(boardId, new UpdateBoardRequest("X", null, null), userId)
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);

        verify(boardRepository, never()).save(any());
    }

    @Test
    void updateBoard_defaultsRoleToMemberWhenNotFound() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(boardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.empty());

        BoardResponse res = boardService.updateBoard(boardId, new UpdateBoardRequest("X", null, null), userId);

        assertThat(res.role()).isEqualTo("MEMBER");
    }

    // Helper: set private fields on models that lack setters for them
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
