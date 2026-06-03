package com.kanban.service;

import com.kanban.dto.request.CreateBoardRequest;
import com.kanban.dto.request.UpdateBoardRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.model.Board;
import com.kanban.model.BoardMember;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.security.Role;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.WorkspaceMemberRepository;
import com.kanban.security.BoardAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardDescriptionTest {

    @Mock BoardRepository boardRepository;
    @Mock BoardMemberRepository memberRepository;
    @Mock BoardAccessPolicy accessPolicy;
    @Mock CardRepository cardRepository;
    @Mock WorkspaceMemberRepository workspaceMemberRepository;

    private BoardService boardService;

    private UUID userId;
    private UUID boardId;
    private Board existingBoard;
    private BoardMember ownerMember;

    @BeforeEach
    void setUp() {
        boardService = new BoardService(
                boardRepository, memberRepository, null, accessPolicy,
                null, null, null, null, cardRepository, workspaceMemberRepository);

        userId = UUID.randomUUID();
        boardId = UUID.randomUUID();

        existingBoard = new Board();
        ReflectionTestUtils.setField(existingBoard, "id", boardId);
        existingBoard.setName("My Board");
        existingBoard.setOwnerId(userId);

        ownerMember = new BoardMember();
        ownerMember.setBoardId(boardId);
        ownerMember.setUserId(userId);
        ownerMember.setRole(Role.OWNER);
    }

    // TC-1: createBoard with description → Board entity has description
    @Test
    void createBoard_withDescription_setsDescriptionOnEntity() {
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> {
            Board b = inv.getArgument(0);
            ReflectionTestUtils.setField(b, "id", UUID.randomUUID());
            return b;
        });
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateBoardRequest req = new CreateBoardRequest("My Board", null, "A useful description");
        boardService.createBoard(req, userId);

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isEqualTo("A useful description");
    }

    // TC-1b: createBoard with null description → description is null on entity
    @Test
    void createBoard_withNullDescription_descriptionIsNull() {
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> {
            Board b = inv.getArgument(0);
            ReflectionTestUtils.setField(b, "id", UUID.randomUUID());
            return b;
        });
        when(memberRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CreateBoardRequest req = new CreateBoardRequest("My Board", null, null);
        boardService.createBoard(req, userId);

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isNull();
    }

    // TC-2: updateBoard with description → Board entity description updated
    @Test
    void updateBoard_withDescription_updatesDescriptionOnEntity() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(existingBoard));
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(ownerMember));

        UpdateBoardRequest req = new UpdateBoardRequest("Renamed", "Updated description", null);
        boardService.updateBoard(boardId, req, userId);

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isEqualTo("Updated description");
    }

    // TC-2b: updateBoard clears description when null provided
    @Test
    void updateBoard_withNullDescription_clearsDescription() {
        existingBoard.setDescription("old description");
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(existingBoard));
        when(boardRepository.save(any(Board.class))).thenAnswer(inv -> inv.getArgument(0));
        when(memberRepository.findByBoardIdAndUserId(boardId, userId)).thenReturn(Optional.of(ownerMember));

        UpdateBoardRequest req = new UpdateBoardRequest("Renamed", null, null);
        boardService.updateBoard(boardId, req, userId);

        ArgumentCaptor<Board> captor = ArgumentCaptor.forClass(Board.class);
        verify(boardRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isNull();
    }

    // TC-3a: Board response includes description field when null
    @Test
    void toBoardResponse_whenDescriptionNull_responseDescriptionIsNull() {
        BoardResponse response = boardService.toBoardResponse(existingBoard, "OWNER", false);
        assertThat(response.description()).isNull();
    }

    // TC-3b: Board response includes description field when set
    @Test
    void toBoardResponse_whenDescriptionSet_responseIncludesDescription() {
        existingBoard.setDescription("Board description here");
        BoardResponse response = boardService.toBoardResponse(existingBoard, "OWNER", false);
        assertThat(response.description()).isEqualTo("Board description here");
    }
}
