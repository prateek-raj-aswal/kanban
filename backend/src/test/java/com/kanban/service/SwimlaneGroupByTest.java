package com.kanban.service;

import com.kanban.dto.request.UpdateBoardRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardMember;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardModuleRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.repository.UserRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.Role;
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

/**
 * TDD tests for US-1403: swimlane group-by config persisted per board.
 */
@ExtendWith(MockitoExtension.class)
class SwimlaneGroupByTest {

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
        board.setName("Test Board");
        board.setOwnerId(userId);

        boardMember = new BoardMember();
        boardMember.setBoardId(boardId);
        boardMember.setUserId(userId);
        boardMember.setRole(Role.OWNER);
    }

    // TC-1: updateBoard with groupBy=ASSIGNEE -> persisted, returned in response
    @Test
    void updateBoard_withGroupByAssignee_persistsAndReturns() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(boardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));

        UpdateBoardRequest req = new UpdateBoardRequest("Test Board", null, "ASSIGNEE");
        BoardResponse res = boardService.updateBoard(boardId, req, userId);

        assertThat(res.groupBy()).isEqualTo("ASSIGNEE");

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getGroupBy()).isEqualTo("ASSIGNEE");
    }

    // TC-2: updateBoard with groupBy=MODULE, no modules -> succeeds with empty modules list (response still OK)
    @Test
    void updateBoard_withGroupByModule_noModules_succeeds() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(boardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));

        UpdateBoardRequest req = new UpdateBoardRequest("Test Board", null, "MODULE");
        BoardResponse res = boardService.updateBoard(boardId, req, userId);

        // Response must succeed (no exception) and groupBy is MODULE
        assertThat(res.groupBy()).isEqualTo("MODULE");
    }

    // TC-3: updateBoard with groupBy=NONE -> persisted as NONE
    @Test
    void updateBoard_withGroupByNone_persistedAsNone() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(boardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));

        UpdateBoardRequest req = new UpdateBoardRequest("Test Board", null, "NONE");
        BoardResponse res = boardService.updateBoard(boardId, req, userId);

        assertThat(res.groupBy()).isEqualTo("NONE");

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getGroupBy()).isEqualTo("NONE");
    }

    // TC-4: updateBoard with invalid groupBy value -> ApiException 422
    @Test
    void updateBoard_withInvalidGroupBy_throws422() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));

        UpdateBoardRequest req = new UpdateBoardRequest("Test Board", null, "INVALID_VALUE");

        assertThatThrownBy(() -> boardService.updateBoard(boardId, req, userId))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> {
                    ApiException apiEx = (ApiException) ex;
                    assertThat(apiEx.getStatus()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
                });

        verify(boardRepository, never()).save(any());
    }

    // TC-5: getBoard -> groupBy field present in BoardResponse (default NONE when null in entity)
    @Test
    void getBoard_groupByFieldPresentInResponse_defaultNoneWhenNull() {
        // board.groupBy is null (simulating old record before migration)
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));
        // No accessPolicy exception thrown = member

        BoardResponse res = boardService.getBoardById(boardId, userId);

        // Should default to "NONE" rather than null
        assertThat(res.groupBy()).isNotNull();
        assertThat(res.groupBy()).isEqualTo("NONE");
    }

    // TC-5b: groupBy=null in request -> keeps current value (no change)
    @Test
    void updateBoard_nullGroupBy_keepsCurrentValue() {
        board.setGroupBy("PRIORITY");
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(boardRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));

        // null groupBy in request -> keep existing PRIORITY
        UpdateBoardRequest req = new UpdateBoardRequest("Test Board", null, null);
        BoardResponse res = boardService.updateBoard(boardId, req, userId);

        assertThat(res.groupBy()).isEqualTo("PRIORITY");

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getGroupBy()).isEqualTo("PRIORITY");
    }

    // Helper: set private fields on models that lack setters
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
