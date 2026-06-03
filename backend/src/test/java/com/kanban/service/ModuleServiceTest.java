package com.kanban.service;

import com.kanban.dto.request.CreateModuleRequest;
import com.kanban.dto.request.RenameModuleRequest;
import com.kanban.dto.response.ModuleResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.BoardColumn;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModuleServiceTest {

    @Mock ModuleRepository moduleRepository;
    @Mock BoardRepository boardRepository;
    @Mock CardRepository cardRepository;
    @Mock CardModuleRepository cardModuleRepository;
    @Mock BoardAccessPolicy accessPolicy;

    @InjectMocks ModuleService moduleService;

    private UUID userId;
    private UUID boardId;
    private UUID moduleId;
    private UUID cardId;
    private Board board;
    private Module module;
    private Card card;

    @BeforeEach
    void setUp() {
        userId   = UUID.randomUUID();
        boardId  = UUID.randomUUID();
        moduleId = UUID.randomUUID();
        cardId   = UUID.randomUUID();

        board = new Board();
        setField(board, "id", boardId);

        module = new Module();
        setField(module, "id", moduleId);
        setField(module, "board", board);
        setField(module, "name", "Sprint 1");

        Board b2 = new Board();
        setField(b2, "id", boardId);
        BoardColumn col = new BoardColumn();
        setField(col, "id", UUID.randomUUID());
        setField(col, "board", b2);

        card = new Card();
        setField(card, "id", cardId);
        setField(card, "column", col);
    }

    // TC-1: createModule → saved with board_id, name, returned as DTO
    @Test
    void createModule_savesAndReturnsDto() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(moduleRepository.save(any())).thenAnswer(inv -> {
            Module m = inv.getArgument(0);
            setField(m, "id", moduleId);
            return m;
        });

        ModuleResponse res = moduleService.createModule(boardId, new CreateModuleRequest("Sprint 1"), userId);

        assertThat(res.id()).isEqualTo(moduleId);
        assertThat(res.name()).isEqualTo("Sprint 1");
        assertThat(res.boardId()).isEqualTo(boardId);
        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);

        ArgumentCaptor<Module> captor = ArgumentCaptor.forClass(Module.class);
        verify(moduleRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Sprint 1");
        assertThat(captor.getValue().getBoard().getId()).isEqualTo(boardId);
    }

    @Test
    void createModule_throwsNotFoundWhenBoardMissing() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            moduleService.createModule(boardId, new CreateModuleRequest("X"), userId)
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    // TC-2: listModules → returns all modules for board
    @Test
    void listModules_returnsAllModulesForBoard() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(moduleRepository.findAllByBoard_Id(boardId)).thenReturn(List.of(module));

        List<ModuleResponse> result = moduleService.listModules(boardId, userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Sprint 1");
        verify(accessPolicy).assertMember(boardId, userId);
    }

    @Test
    void listModules_returnsEmptyWhenNone() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(moduleRepository.findAllByBoard_Id(boardId)).thenReturn(List.of());

        List<ModuleResponse> result = moduleService.listModules(boardId, userId);

        assertThat(result).isEmpty();
    }

    // TC-3: renameModule → name updated
    @Test
    void renameModule_updatesName() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(moduleRepository.save(any())).thenReturn(module);

        ModuleResponse res = moduleService.renameModule(moduleId, new RenameModuleRequest("Sprint 2"), userId);

        assertThat(res.name()).isEqualTo("Sprint 2");
        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);
        ArgumentCaptor<Module> captor = ArgumentCaptor.forClass(Module.class);
        verify(moduleRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Sprint 2");
    }

    @Test
    void renameModule_throwsNotFoundWhenModuleMissing() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            moduleService.renameModule(moduleId, new RenameModuleRequest("X"), userId)
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    // TC-4: deleteModule → module deleted (cascade removes card_modules)
    @Test
    void deleteModule_deletesModule() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));

        moduleService.deleteModule(moduleId, userId);

        verify(moduleRepository).delete(module);
        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);
    }

    @Test
    void deleteModule_throwsNotFoundWhenModuleMissing() {
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> moduleService.deleteModule(moduleId, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    // TC-5: assignModule to card → card_modules row created
    @Test
    void assignModule_savesCardModuleRow() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(cardModuleRepository.existsById(new CardModuleId(cardId, moduleId))).thenReturn(false);
        when(cardModuleRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        moduleService.assignModule(cardId, moduleId, userId);

        ArgumentCaptor<CardModule> captor = ArgumentCaptor.forClass(CardModule.class);
        verify(cardModuleRepository).save(captor.capture());
        assertThat(captor.getValue().getCard()).isEqualTo(cardId);
        assertThat(captor.getValue().getModule()).isEqualTo(moduleId);
        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);
    }

    @Test
    void assignModule_throwsConflictIfAlreadyAssigned() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(cardModuleRepository.existsById(new CardModuleId(cardId, moduleId))).thenReturn(true);

        assertThatThrownBy(() -> moduleService.assignModule(cardId, moduleId, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    void assignModule_throwsNotFoundWhenCardMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> moduleService.assignModule(cardId, moduleId, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    // TC-6: unassignModule from card → card_modules row removed
    @Test
    void unassignModule_deletesCardModuleRow() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(cardModuleRepository.existsById(new CardModuleId(cardId, moduleId))).thenReturn(true);

        moduleService.unassignModule(cardId, moduleId, userId);

        verify(cardModuleRepository).deleteById(new CardModuleId(cardId, moduleId));
        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);
    }

    @Test
    void unassignModule_throwsNotFoundIfNotAssigned() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.of(card));
        when(moduleRepository.findById(moduleId)).thenReturn(Optional.of(module));
        when(cardModuleRepository.existsById(new CardModuleId(cardId, moduleId))).thenReturn(false);

        assertThatThrownBy(() -> moduleService.unassignModule(cardId, moduleId, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void unassignModule_throwsNotFoundWhenCardMissing() {
        when(cardRepository.findActiveById(cardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> moduleService.unassignModule(cardId, moduleId, userId))
            .isInstanceOf(ApiException.class)
            .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    private static void setField(Object obj, String field, Object value) {
        try {
            var f = findField(obj.getClass(), field);
            f.setAccessible(true);
            f.set(obj, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static java.lang.reflect.Field findField(Class<?> clazz, String name) throws NoSuchFieldException {
        try { return clazz.getDeclaredField(name); }
        catch (NoSuchFieldException e) {
            if (clazz.getSuperclass() != null) return findField(clazz.getSuperclass(), name);
            throw e;
        }
    }
}
