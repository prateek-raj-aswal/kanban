package com.kanban.service;

import com.kanban.dto.request.CreateInvitationRequest;
import com.kanban.dto.response.InvitationResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.Invitation;
import com.kanban.model.User;
import com.kanban.repository.BoardMemberRepository;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.InvitationRepository;
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

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvitationServiceTest {

    @Mock InvitationRepository invitationRepository;
    @Mock BoardRepository boardRepository;
    @Mock BoardMemberRepository memberRepository;
    @Mock UserRepository userRepository;
    @Mock BoardAccessPolicy accessPolicy;

    @InjectMocks InvitationService invitationService;

    private UUID boardId;
    private UUID requestingUserId;
    private Board board;

    @BeforeEach
    void setUp() {
        boardId = UUID.randomUUID();
        requestingUserId = UUID.randomUUID();

        board = new Board();
        setField(board, "id", boardId);
        setField(board, "name", "Test Board");
        setField(board, "ownerId", requestingUserId);
    }

    @Test
    void createInvitation_savesAndReturnsResponse() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(userRepository.findActiveByEmail("invitee@example.com")).thenReturn(Optional.empty());
        when(invitationRepository.save(any())).thenAnswer(inv -> {
            Invitation i = inv.getArgument(0);
            setField(i, "id", UUID.randomUUID());
            return i;
        });

        InvitationResponse response = invitationService.createInvitation(
                boardId, new CreateInvitationRequest("invitee@example.com"), requestingUserId);

        assertThat(response.boardId()).isEqualTo(boardId);
        assertThat(response.inviteeEmail()).isEqualTo("invitee@example.com");
        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(response.token()).isNotBlank().hasSize(64);
        assertThat(response.expiresAt()).isAfter(Instant.now());
    }

    @Test
    void createInvitation_tokenIsUnique() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(userRepository.findActiveByEmail(any())).thenReturn(Optional.empty());
        when(invitationRepository.save(any())).thenAnswer(inv -> {
            Invitation i = inv.getArgument(0);
            setField(i, "id", UUID.randomUUID());
            return i;
        });

        InvitationResponse r1 = invitationService.createInvitation(boardId, new CreateInvitationRequest("a@a.com"), requestingUserId);
        InvitationResponse r2 = invitationService.createInvitation(boardId, new CreateInvitationRequest("b@b.com"), requestingUserId);

        assertThat(r1.token()).isNotEqualTo(r2.token());
    }

    @Test
    void createInvitation_throwsNotFoundWhenBoardMissing() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                invitationService.createInvitation(boardId, new CreateInvitationRequest("x@x.com"), requestingUserId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void createInvitation_throwsConflictWhenInviteeAlreadyMember() {
        UUID inviteeId = UUID.randomUUID();
        User invitee = new User();
        setField(invitee, "id", inviteeId);
        setField(invitee, "email", "member@example.com");

        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(userRepository.findActiveByEmail("member@example.com")).thenReturn(Optional.of(invitee));
        when(memberRepository.existsByBoardIdAndUserId(boardId, inviteeId)).thenReturn(true);

        assertThatThrownBy(() ->
                invitationService.createInvitation(boardId, new CreateInvitationRequest("member@example.com"), requestingUserId))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    void createInvitation_succeedsWhenInviteeNotYetRegistered() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(userRepository.findActiveByEmail("new@example.com")).thenReturn(Optional.empty());
        when(invitationRepository.save(any())).thenAnswer(inv -> {
            Invitation i = inv.getArgument(0);
            setField(i, "id", UUID.randomUUID());
            return i;
        });

        InvitationResponse response = invitationService.createInvitation(
                boardId, new CreateInvitationRequest("new@example.com"), requestingUserId);

        assertThat(response.inviteeEmail()).isEqualTo("new@example.com");
        verify(memberRepository, never()).existsByBoardIdAndUserId(any(), any());
    }

    // ── acceptInvitation ─────────────────────────────────────────────────────

    @Test
    void acceptInvitation_addsMemberAndMarksAccepted() {
        UUID acceptingUserId = UUID.randomUUID();
        Invitation invitation = new Invitation();
        setField(invitation, "id", UUID.randomUUID());
        setField(invitation, "boardId", boardId);
        setField(invitation, "status", "PENDING");
        setField(invitation, "expiresAt", Instant.now().plusSeconds(3600));

        when(invitationRepository.findByToken("tok")).thenReturn(Optional.of(invitation));
        when(memberRepository.existsByBoardIdAndUserId(boardId, acceptingUserId)).thenReturn(false);
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));

        invitationService.acceptInvitation("tok", acceptingUserId);

        verify(memberRepository).save(any());
        ArgumentCaptor<Invitation> captor = ArgumentCaptor.forClass(Invitation.class);
        verify(invitationRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo("ACCEPTED");
    }

    @Test
    void acceptInvitation_throwsGoneWhenExpired() {
        Invitation invitation = new Invitation();
        setField(invitation, "id", UUID.randomUUID());
        setField(invitation, "boardId", boardId);
        setField(invitation, "status", "PENDING");
        setField(invitation, "expiresAt", Instant.now().minusSeconds(1));

        when(invitationRepository.findByToken("expired")).thenReturn(Optional.of(invitation));

        assertThatThrownBy(() -> invitationService.acceptInvitation("expired", UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.GONE);
    }

    @Test
    void acceptInvitation_throwsConflictWhenAlreadyUsed() {
        Invitation invitation = new Invitation();
        setField(invitation, "id", UUID.randomUUID());
        setField(invitation, "boardId", boardId);
        setField(invitation, "status", "ACCEPTED");
        setField(invitation, "expiresAt", Instant.now().plusSeconds(3600));

        when(invitationRepository.findByToken("used")).thenReturn(Optional.of(invitation));

        assertThatThrownBy(() -> invitationService.acceptInvitation("used", UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    void acceptInvitation_throwsNotFoundWhenTokenUnknown() {
        when(invitationRepository.findByToken("bad")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invitationService.acceptInvitation("bad", UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    private static void setField(Object obj, String name, Object value) {
        try {
            var f = findField(obj.getClass(), name);
            f.setAccessible(true);
            f.set(obj, value);
        } catch (Exception e) { throw new RuntimeException(e); }
    }

    private static java.lang.reflect.Field findField(Class<?> c, String name) throws NoSuchFieldException {
        try { return c.getDeclaredField(name); }
        catch (NoSuchFieldException e) {
            if (c.getSuperclass() != null) return findField(c.getSuperclass(), name);
            throw e;
        }
    }
}
