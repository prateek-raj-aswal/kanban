package com.kanban.service;

import com.kanban.dto.response.BoardResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.BoardStar;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.BoardStarRepository;
import com.kanban.websocket.BoardEventPayload;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BoardStarService {

    private final BoardStarRepository boardStarRepository;
    private final BoardRepository boardRepository;
    private final BoardMemberRepository memberRepository;
    private final BoardService boardService;
    private final EventBroadcastService eventBroadcastService;

    public BoardStarService(BoardStarRepository boardStarRepository,
                            BoardRepository boardRepository,
                            BoardMemberRepository memberRepository,
                            BoardService boardService,
                            EventBroadcastService eventBroadcastService) {
        this.boardStarRepository = boardStarRepository;
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.boardService = boardService;
        this.eventBroadcastService = eventBroadcastService;
    }

    @Transactional
    public void starBoard(UUID boardId, UUID userId) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        if (!memberRepository.existsByBoardIdAndUserId(boardId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not a board member");
        }
        if (!boardStarRepository.existsByUserIdAndBoardId(userId, boardId)) {
            BoardStar star = new BoardStar();
            star.setUserId(userId);
            star.setBoardId(boardId);
            boardStarRepository.save(star);
            eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("BOARD_STARRED", boardId,
                    new BoardEventPayload.BoardStarredData(boardId, userId, star.getStarredAt())));
        }
    }

    @Transactional
    public void unstarBoard(UUID boardId, UUID userId) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        if (boardStarRepository.existsByUserIdAndBoardId(userId, boardId)) {
            boardStarRepository.deleteByUserIdAndBoardId(userId, boardId);
            eventBroadcastService.broadcastBoardEvent(boardId, BoardEventPayload.of("BOARD_UNSTARRED", boardId,
                    new BoardEventPayload.BoardUnstarredData(boardId, userId)));
        }
    }

    @Transactional(readOnly = true)
    public List<BoardResponse> getStarredBoards(UUID userId) {
        return boardStarRepository.findByUserIdOrderByStarredAtDesc(userId).stream()
                .map(star -> boardRepository.findActiveById(star.getBoardId()).orElse(null))
                .filter(b -> b != null)
                .map(b -> {
                    String role = memberRepository.findByBoardIdAndUserId(b.getId(), userId)
                            .map(m -> m.getRoleString()).orElse(com.kanban.security.Role.MEMBER.name());
                    return boardService.toBoardResponse(b, role, false);
                })
                .toList();
    }
}
