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

    public void assertAccess(UUID boardId, UUID userId, BoardAction action) {
        if (action == BoardAction.READ) {
            if (!memberRepository.existsByBoardIdAndUserId(boardId, userId)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
            }
        } else {
            memberRepository.findByBoardIdAndUserId(boardId, userId)
                    .filter(member -> !member.getRole().equals("VIEWER"))
                    .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied"));
        }
    }

    @Deprecated
    public void assertMember(UUID boardId, UUID userId) {
        assertAccess(boardId, userId, BoardAction.READ);
    }

    public boolean isMember(UUID boardId, UUID userId) {
        return memberRepository.existsByBoardIdAndUserId(boardId, userId);
    }
}
