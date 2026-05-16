package com.kanban.service;

import com.kanban.dto.request.CreateBoardRequest;
import com.kanban.dto.request.UpdateBoardRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.dto.response.CardResponse;
import com.kanban.dto.response.ColumnResponse;
import com.kanban.dto.response.LabelResponse;
import com.kanban.dto.response.MemberResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardMember;
import com.kanban.model.User;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.CommentRepository;
import com.kanban.repository.SubtaskRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.BoardAccessPolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final BoardMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final BoardAccessPolicy accessPolicy;
    private final SubtaskRepository subtaskRepository;
    private final CommentRepository commentRepository;

    public BoardService(BoardRepository boardRepository,
                        BoardMemberRepository memberRepository,
                        UserRepository userRepository,
                        BoardAccessPolicy accessPolicy,
                        SubtaskRepository subtaskRepository,
                        CommentRepository commentRepository) {
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.accessPolicy = accessPolicy;
        this.subtaskRepository = subtaskRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public BoardResponse createBoard(CreateBoardRequest request, UUID requestingUserId) {
        Board board = new Board();
        board.setName(request.name());
        board.setOwnerId(requestingUserId);
        board = boardRepository.save(board);

        BoardMember member = new BoardMember();
        member.setBoardId(board.getId());
        member.setUserId(requestingUserId);
        member.setRole("OWNER");
        memberRepository.save(member);

        return toBoardResponse(board, "OWNER", false);
    }

    @Transactional(readOnly = true)
    public List<BoardResponse> getBoardsForUser(UUID userId) {
        return boardRepository.findAllActiveByMember(userId).stream()
                .map(b -> {
                    String role = memberRepository.findByBoardIdAndUserId(b.getId(), userId)
                            .map(BoardMember::getRole).orElse("MEMBER");
                    return toBoardResponse(b, role, false);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public BoardResponse getBoardById(UUID boardId, UUID requestingUserId) {
        Board board = boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertMember(boardId, requestingUserId);
        String role = memberRepository.findByBoardIdAndUserId(boardId, requestingUserId)
                .map(BoardMember::getRole).orElse("MEMBER");
        return toBoardResponse(board, role, true);
    }

    @Transactional
    public BoardResponse updateBoard(UUID boardId, UpdateBoardRequest request, UUID requestingUserId) {
        Board board = boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertMember(boardId, requestingUserId);
        board.setName(request.name());
        board = boardRepository.save(board);
        String role = memberRepository.findByBoardIdAndUserId(boardId, requestingUserId)
                .map(BoardMember::getRole).orElse("MEMBER");
        return toBoardResponse(board, role, false);
    }

    @Transactional
    public void deleteBoard(UUID boardId, UUID requestingUserId) {
        Board board = boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        if (!board.getOwnerId().equals(requestingUserId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Only the owner can delete this board");
        }
        board.setDeletedAt(Instant.now());
        boardRepository.save(board);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getMembers(UUID boardId, UUID requestingUserId) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertMember(boardId, requestingUserId);

        List<BoardMember> members = memberRepository.findAllByBoardId(boardId);
        List<UUID> userIds = members.stream().map(BoardMember::getUserId).toList();
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return members.stream()
                .map(m -> {
                    User u = userMap.get(m.getUserId());
                    return new MemberResponse(m.getUserId(),
                            u != null ? u.getDisplayName() : "",
                            u != null ? u.getEmail() : "",
                            m.getRole(), m.getJoinedAt());
                })
                .toList();
    }

    private BoardResponse toBoardResponse(Board board, String role, boolean includeColumns) {
        List<ColumnResponse> columns = null;
        if (includeColumns) {
            List<UUID> cardIds = board.getColumns().stream()
                    .filter(c -> c.getDeletedAt() == null)
                    .flatMap(c -> c.getCards().stream().filter(card -> card.getDeletedAt() == null))
                    .map(card -> card.getId())
                    .toList();

            Map<UUID, int[]> subtaskCounts = cardIds.isEmpty() ? Map.of()
                    : subtaskRepository.getCountsByCardIds(cardIds);
            Map<UUID, Integer> commentCounts = cardIds.isEmpty() ? Map.of()
                    : commentRepository.getCountsByCardIds(cardIds);

            columns = board.getColumns().stream()
                    .filter(c -> c.getDeletedAt() == null)
                    .map(c -> {
                        List<CardResponse> cards = c.getCards().stream()
                                .filter(card -> card.getDeletedAt() == null)
                                .map(card -> {
                                    int[] sc = subtaskCounts.getOrDefault(card.getId(), new int[]{0, 0});
                                    int cc = commentCounts.getOrDefault(card.getId(), 0);
                                    return new CardResponse(
                                            card.getId(), card.getColumn().getId(),
                                            card.getTitle(), card.getDescription(),
                                            card.getPosition(), card.getAssigneeId(), card.getDueDate(),
                                            card.getPriority(),
                                            card.getLabels().stream()
                                                    .map(l -> new LabelResponse(l.getId(), l.getName(), l.getColor()))
                                                    .toList(),
                                            sc[0], sc[1], cc,
                                            card.getCreatedAt(), card.getUpdatedAt()
                                    );
                                })
                                .toList();
                        return new ColumnResponse(c.getId(), c.getBoard().getId(), c.getName(),
                                c.getPosition(), c.getCreatedAt(), cards);
                    })
                    .toList();
        }
        return new BoardResponse(board.getId(), board.getName(), board.getOwnerId(),
                role, board.getCreatedAt(), columns);
    }
}
