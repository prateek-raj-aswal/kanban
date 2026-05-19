package com.kanban.service;

import com.kanban.dto.request.CreateBoardRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.model.Board;
import com.kanban.model.BoardMember;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.CardAssigneeRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.BoardAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardWorkspaceTest {

    @Mock BoardRepository boardRepository;
    @Mock BoardMemberRepository memberRepository;
    @Mock UserRepository userRepository;
    @Mock BoardAccessPolicy accessPolicy;
    @Mock SubtaskRepository subtaskRepository;
    @Mock CommentRepository commentRepository;
    @Mock CardAssigneeRepository cardAssigneeRepository;
    @Mock CardRepository cardRepository;

    private BoardService boardService;

    private UUID userId;
    private UUID boardId;
    private UUID workspaceId;
    private Board board;
    private BoardMember boardMember;

    @BeforeEach
    void setUp() {
        boardService = new BoardService(boardRepository, memberRepository, userRepository,
                accessPolicy, subtaskRepository, commentRepository, cardAssigneeRepository, cardRepository);

        userId      = UUID.randomUUID();
        boardId     = UUID.randomUUID();
        workspaceId = UUID.randomUUID();

        board = new Board();
        setField(board, "id", boardId);
        board.setName("My Board");
        board.setOwnerId(userId);

        boardMember = new BoardMember();
        boardMember.setBoardId(boardId);
        boardMember.setUserId(userId);
        boardMember.setRole("OWNER");
    }

    @Test
    void createBoard_withWorkspaceId_setsWorkspaceIdOnBoard() {
        when(boardRepository.save(any())).thenAnswer(inv -> {
            Board b = inv.getArgument(0);
            setField(b, "id", boardId);
            return b;
        });
        when(memberRepository.save(any())).thenReturn(boardMember);

        BoardResponse res = boardService.createBoard(new CreateBoardRequest("New Board", workspaceId), userId);

        assertThat(res.workspaceId()).isEqualTo(workspaceId);

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getWorkspaceId()).isEqualTo(workspaceId);
    }

    @Test
    void createBoard_withoutWorkspaceId_returnsNullWorkspaceId() {
        when(boardRepository.save(any())).thenAnswer(inv -> {
            Board b = inv.getArgument(0);
            setField(b, "id", boardId);
            return b;
        });
        when(memberRepository.save(any())).thenReturn(boardMember);

        BoardResponse res = boardService.createBoard(new CreateBoardRequest("New Board", null), userId);

        assertThat(res.workspaceId()).isNull();
    }

    @Test
    void getBoardById_responseIncludesWorkspaceId() {
        setField(board, "workspaceId", workspaceId);
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));

        BoardResponse res = boardService.getBoardById(boardId, userId);

        assertThat(res.workspaceId()).isEqualTo(workspaceId);
    }

    @Test
    void getBoardById_responseIncludesNullWorkspaceIdWhenNotAssigned() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(boardMember));

        BoardResponse res = boardService.getBoardById(boardId, userId);

        assertThat(res.workspaceId()).isNull();
    }

    // ── helper ────────────────────────────────────────────────────────────────

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
