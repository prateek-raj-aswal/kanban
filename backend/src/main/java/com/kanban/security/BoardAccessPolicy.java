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

    public void assertMember(UUID boardId, UUID userId) {
        if (!memberRepository.existsByBoardIdAndUserId(boardId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Access denied");
        }
    }

    public boolean isMember(UUID boardId, UUID userId) {
        return memberRepository.existsByBoardIdAndUserId(boardId, userId);
    }
}
