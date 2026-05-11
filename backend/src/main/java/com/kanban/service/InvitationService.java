package com.kanban.service;

import com.kanban.dto.request.CreateInvitationRequest;
import com.kanban.dto.response.BoardResponse;
import com.kanban.dto.response.InvitationResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.BoardMember;
import com.kanban.model.Invitation;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.InvitationRepository;
import com.kanban.repository.UserRepository;
import com.kanban.security.BoardAccessPolicy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class InvitationService {

    private static final int EXPIRY_DAYS = 7;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final InvitationRepository invitationRepository;
    private final BoardRepository boardRepository;
    private final BoardMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final BoardAccessPolicy accessPolicy;

    public InvitationService(InvitationRepository invitationRepository,
                              BoardRepository boardRepository,
                              BoardMemberRepository memberRepository,
                              UserRepository userRepository,
                              BoardAccessPolicy accessPolicy) {
        this.invitationRepository = invitationRepository;
        this.boardRepository = boardRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
        this.accessPolicy = accessPolicy;
    }

    @Transactional
    public InvitationResponse createInvitation(UUID boardId, CreateInvitationRequest request,
                                               UUID requestingUserId) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));

        accessPolicy.assertMember(boardId, requestingUserId);

        // If the invitee is already a registered user, check they're not already a member
        userRepository.findActiveByEmail(request.email()).ifPresent(existingUser -> {
            if (memberRepository.existsByBoardIdAndUserId(boardId, existingUser.getId())) {
                throw new ApiException(HttpStatus.CONFLICT, "USER_ALREADY_MEMBER",
                        "User is already a member of this board");
            }
        });

        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);

        Invitation invitation = new Invitation();
        invitation.setBoardId(boardId);
        invitation.setInvitedBy(requestingUserId);
        invitation.setInviteeEmail(request.email());
        invitation.setToken(token);
        invitation.setExpiresAt(Instant.now().plus(EXPIRY_DAYS, ChronoUnit.DAYS));
        invitation = invitationRepository.save(invitation);

        return toResponse(invitation);
    }

    @Transactional
    public BoardResponse acceptInvitation(String token, UUID requestingUserId) {
        Invitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INVITATION_NOT_FOUND",
                        "Invitation not found"));

        if (invitation.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.GONE, "INVITATION_EXPIRED", "Invitation has expired");
        }
        if (!"PENDING".equals(invitation.getStatus())) {
            throw new ApiException(HttpStatus.CONFLICT, "INVITATION_ALREADY_USED",
                    "Invitation has already been used");
        }

        // Idempotent: if already a member, just return the board
        if (!memberRepository.existsByBoardIdAndUserId(invitation.getBoardId(), requestingUserId)) {
            BoardMember member = new BoardMember();
            member.setBoardId(invitation.getBoardId());
            member.setUserId(requestingUserId);
            member.setRole("MEMBER");
            memberRepository.save(member);
        }

        invitation.setStatus("ACCEPTED");
        invitationRepository.save(invitation);

        return boardRepository.findActiveById(invitation.getBoardId())
                .map(b -> new BoardResponse(b.getId(), b.getName(), b.getOwnerId(), "MEMBER",
                        b.getCreatedAt(), null))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
    }

    private InvitationResponse toResponse(Invitation inv) {
        return new InvitationResponse(inv.getId(), inv.getBoardId(), inv.getInviteeEmail(),
                inv.getToken(), inv.getStatus(), inv.getExpiresAt());
    }
}
