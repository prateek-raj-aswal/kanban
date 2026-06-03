package com.kanban.service;

import com.kanban.dto.request.CreateModuleRequest;
import com.kanban.dto.request.RenameModuleRequest;
import com.kanban.dto.response.ModuleResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Card;
import com.kanban.model.CardModule;
import com.kanban.model.CardModuleId;
import com.kanban.model.Module;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.CardModuleRepository;
import com.kanban.repository.CardRepository;
import com.kanban.repository.ModuleRepository;
import com.kanban.security.BoardAccessPolicy;
import com.kanban.security.BoardAction;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final CardModuleRepository cardModuleRepository;
    private final BoardAccessPolicy accessPolicy;

    public ModuleService(ModuleRepository moduleRepository, BoardRepository boardRepository,
                         CardRepository cardRepository, CardModuleRepository cardModuleRepository,
                         BoardAccessPolicy accessPolicy) {
        this.moduleRepository = moduleRepository;
        this.boardRepository = boardRepository;
        this.cardRepository = cardRepository;
        this.cardModuleRepository = cardModuleRepository;
        this.accessPolicy = accessPolicy;
    }

    @Transactional
    public ModuleResponse createModule(UUID boardId, CreateModuleRequest request, UUID requestingUserId) {
        var board = boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertAccess(boardId, requestingUserId, BoardAction.WRITE);

        Module module = new Module();
        module.setBoard(board);
        module.setName(request.name());
        module = moduleRepository.save(module);
        return toResponse(module);
    }

    @Transactional(readOnly = true)
    public List<ModuleResponse> listModules(UUID boardId, UUID requestingUserId) {
        boardRepository.findActiveById(boardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOARD_NOT_FOUND", "Board not found"));
        accessPolicy.assertMember(boardId, requestingUserId);
        return moduleRepository.findAllByBoard_Id(boardId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public ModuleResponse renameModule(UUID moduleId, RenameModuleRequest request, UUID requestingUserId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MODULE_NOT_FOUND", "Module not found"));
        accessPolicy.assertAccess(module.getBoard().getId(), requestingUserId, BoardAction.WRITE);
        module.setName(request.name());
        module = moduleRepository.save(module);
        return toResponse(module);
    }

    @Transactional
    public void deleteModule(UUID moduleId, UUID requestingUserId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MODULE_NOT_FOUND", "Module not found"));
        accessPolicy.assertAccess(module.getBoard().getId(), requestingUserId, BoardAction.WRITE);
        moduleRepository.delete(module);
    }

    @Transactional
    public void assignModule(UUID cardId, UUID moduleId, UUID requestingUserId) {
        Card card = cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MODULE_NOT_FOUND", "Module not found"));

        UUID boardId = card.getColumn().getBoard().getId();
        if (!module.getBoard().getId().equals(boardId)) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "MODULE_BOARD_MISMATCH",
                    "Module does not belong to the card's board");
        }
        accessPolicy.assertAccess(boardId, requestingUserId, BoardAction.WRITE);

        CardModuleId id = new CardModuleId(cardId, moduleId);
        if (cardModuleRepository.existsById(id)) {
            throw new ApiException(HttpStatus.CONFLICT, "ALREADY_ASSIGNED", "Module already assigned to card");
        }

        CardModule cm = new CardModule();
        cm.setCard(cardId);
        cm.setModule(moduleId);
        cardModuleRepository.save(cm);
    }

    @Transactional
    public void unassignModule(UUID cardId, UUID moduleId, UUID requestingUserId) {
        Card card = cardRepository.findActiveById(cardId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CARD_NOT_FOUND", "Card not found"));
        moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MODULE_NOT_FOUND", "Module not found"));

        UUID boardId = card.getColumn().getBoard().getId();
        accessPolicy.assertAccess(boardId, requestingUserId, BoardAction.WRITE);

        CardModuleId id = new CardModuleId(cardId, moduleId);
        if (!cardModuleRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "NOT_ASSIGNED", "Module not assigned to card");
        }
        cardModuleRepository.deleteById(id);
    }

    public List<ModuleResponse> getModulesForCard(UUID cardId) {
        return cardModuleRepository.findByCard(cardId).stream()
                .map(cm -> toResponse(cm.getModuleEntity()))
                .toList();
    }

    private ModuleResponse toResponse(Module module) {
        return new ModuleResponse(module.getId(), module.getBoard().getId(), module.getName());
    }
}
