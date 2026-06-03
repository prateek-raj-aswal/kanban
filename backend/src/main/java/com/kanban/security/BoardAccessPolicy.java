package com.kanban.security;

import com.kanban.exception.ApiException;
import com.kanban.repository.BoardMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class BoardAccessPolicy {

    private final BoardMemberRepository memberRepository;

    public BoardAccessPolicy(BoardMemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    /**
     * Assert that {@code userId} has at least the given {@code action} on {@code boardId}.
     * VIEWER may only READ; MEMBER/ADMIN/OWNER may WRITE.
     */
    public void assertAccess(UUID boardId, UUID userId, BoardAction action) {
        if (action == BoardAction.READ) {
            if (!memberRepository.existsByBoardIdAndUserId(boardId, userId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
            }
        } else {
            memberRepository.findByBoardIdAndUserId(boardId, userId)
                    .filter(member -> member.getRole() != null && member.getRole().ordinal() >= Role.MEMBER.ordinal())
                    .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied"));
        }
    }

    /**
     * Assert that {@code userId} has at least {@code minimumRole} on {@code boardId}.
     * Uses enum ordinal ordering: VIEWER(0) < MEMBER(1) < ADMIN(2) < OWNER(3).
     */
    public void assertRole(UUID boardId, UUID userId, Role minimumRole) {
        memberRepository.findByBoardIdAndUserId(boardId, userId)
                .filter(member -> member.getRole() != null && member.getRole().ordinal() >= minimumRole.ordinal())
                .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied"));
    }

    @Deprecated
    public void assertMember(UUID boardId, UUID userId) {
        assertAccess(boardId, userId, BoardAction.READ);
    }

    public boolean isMember(UUID boardId, UUID userId) {
        return memberRepository.existsByBoardIdAndUserId(boardId, userId);
    }
}
