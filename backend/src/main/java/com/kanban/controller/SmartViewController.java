package com.kanban.controller;

import com.kanban.dto.response.SmartCardResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.SmartViewService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/me")
public class SmartViewController {

    private final SmartViewService smartViewService;

    public SmartViewController(SmartViewService smartViewService) {
        this.smartViewService = smartViewService;
    }

    @GetMapping("/inbox")
    public List<SmartCardResponse> inbox(@AuthenticationPrincipal AuthenticatedUser principal) {
        return smartViewService.inbox(principal.id());
    }

    @GetMapping("/today")
    public List<SmartCardResponse> today(@AuthenticationPrincipal AuthenticatedUser principal) {
        return smartViewService.today(principal.id());
    }

    @GetMapping("/upcoming")
    public List<SmartCardResponse> upcoming(@AuthenticationPrincipal AuthenticatedUser principal) {
        return smartViewService.upcoming(principal.id());
    }
}
