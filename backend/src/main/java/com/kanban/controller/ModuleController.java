package com.kanban.controller;

import com.kanban.dto.request.CreateModuleRequest;
import com.kanban.dto.request.RenameModuleRequest;
import com.kanban.dto.response.ModuleResponse;
import com.kanban.security.AuthenticatedUser;
import com.kanban.service.ModuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @PostMapping("/api/v1/boards/{boardId}/modules")
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleResponse createModule(@PathVariable UUID boardId,
                                       @Valid @RequestBody CreateModuleRequest request,
                                       @AuthenticationPrincipal AuthenticatedUser principal) {
        return moduleService.createModule(boardId, request, principal.id());
    }

    @GetMapping("/api/v1/boards/{boardId}/modules")
    public List<ModuleResponse> listModules(@PathVariable UUID boardId,
                                             @AuthenticationPrincipal AuthenticatedUser principal) {
        return moduleService.listModules(boardId, principal.id());
    }

    @PatchMapping("/api/v1/boards/{boardId}/modules/{moduleId}")
    public ModuleResponse renameModule(@PathVariable UUID boardId,
                                       @PathVariable UUID moduleId,
                                       @Valid @RequestBody RenameModuleRequest request,
                                       @AuthenticationPrincipal AuthenticatedUser principal) {
        return moduleService.renameModule(moduleId, request, principal.id());
    }

    @DeleteMapping("/api/v1/boards/{boardId}/modules/{moduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteModule(@PathVariable UUID boardId,
                             @PathVariable UUID moduleId,
                             @AuthenticationPrincipal AuthenticatedUser principal) {
        moduleService.deleteModule(moduleId, principal.id());
    }

    @PostMapping("/api/v1/cards/{cardId}/modules/{moduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void assignModule(@PathVariable UUID cardId,
                             @PathVariable UUID moduleId,
                             @AuthenticationPrincipal AuthenticatedUser principal) {
        moduleService.assignModule(cardId, moduleId, principal.id());
    }

    @DeleteMapping("/api/v1/cards/{cardId}/modules/{moduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unassignModule(@PathVariable UUID cardId,
                               @PathVariable UUID moduleId,
                               @AuthenticationPrincipal AuthenticatedUser principal) {
        moduleService.unassignModule(cardId, moduleId, principal.id());
    }
}
