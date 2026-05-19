package com.kanban.service;

import com.kanban.dto.request.CreateLabelRequest;
import com.kanban.dto.request.UpdateLabelRequest;
import com.kanban.dto.response.LabelResponse;
import com.kanban.exception.ApiException;
import com.kanban.model.Board;
import com.kanban.model.Label;
import com.kanban.repository.BoardRepository;
import com.kanban.repository.LabelRepository;
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
class LabelServiceTest {

    @Mock LabelRepository labelRepository;
    @Mock BoardRepository boardRepository;
    @Mock BoardAccessPolicy accessPolicy;

    @InjectMocks LabelService labelService;

    private UUID userId;
    private UUID boardId;
    private UUID labelId;
    private Board board;
    private Label label;

    @BeforeEach
    void setUp() {
        userId  = UUID.randomUUID();
        boardId = UUID.randomUUID();
        labelId = UUID.randomUUID();

        board = new Board();
        setField(board, "id", boardId);

        label = new Label();
        setField(label, "id", labelId);
        setField(label, "boardId", boardId);
        setField(label, "name", "Bug");
        setField(label, "color", "#dc2626");
    }

    @Test
    void createLabel_savesAndReturnsLabel() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(labelRepository.save(any())).thenAnswer(inv -> {
            Label saved = inv.getArgument(0);
            setField(saved, "id", labelId);
            return saved;
        });

        CreateLabelRequest req = new CreateLabelRequest("Feature", "#16a34a");
        LabelResponse res = labelService.createLabel(boardId, req, userId);

        assertThat(res.name()).isEqualTo("Feature");
        assertThat(res.color()).isEqualTo("#16a34a");
        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);
    }

    @Test
    void createLabel_throwsNotFoundWhenBoardMissing() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            labelService.createLabel(boardId, new CreateLabelRequest("X", "#000000"), userId)
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void getLabels_returnsAllLabelsForBoard() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(labelRepository.findByBoardId(boardId)).thenReturn(List.of(label));

        List<LabelResponse> result = labelService.getLabels(boardId, userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Bug");
        assertThat(result.get(0).color()).isEqualTo("#dc2626");
    }

    @Test
    void getLabels_returnsEmptyListWhenNoLabels() {
        when(boardRepository.findActiveById(boardId)).thenReturn(Optional.of(board));
        when(labelRepository.findByBoardId(boardId)).thenReturn(List.of());

        List<LabelResponse> result = labelService.getLabels(boardId, userId);

        assertThat(result).isEmpty();
    }

    @Test
    void updateLabel_updatesNameAndColor() {
        when(labelRepository.findById(labelId)).thenReturn(Optional.of(label));
        when(labelRepository.save(any())).thenReturn(label);

        UpdateLabelRequest req = new UpdateLabelRequest("Hotfix", "#7c3aed");
        LabelResponse res = labelService.updateLabel(labelId, req, userId);

        assertThat(res.name()).isEqualTo("Hotfix");
        assertThat(res.color()).isEqualTo("#7c3aed");
        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);
    }

    @Test
    void updateLabel_skipsNameUpdateWhenBlank() {
        when(labelRepository.findById(labelId)).thenReturn(Optional.of(label));
        when(labelRepository.save(any())).thenReturn(label);

        UpdateLabelRequest req = new UpdateLabelRequest("  ", "#000000");
        labelService.updateLabel(labelId, req, userId);

        ArgumentCaptor<Label> captor = ArgumentCaptor.forClass(Label.class);
        verify(labelRepository).save(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Bug"); // unchanged
    }

    @Test
    void updateLabel_throwsNotFoundWhenLabelMissing() {
        when(labelRepository.findById(labelId)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            labelService.updateLabel(labelId, new UpdateLabelRequest("X", null), userId)
        ).isInstanceOf(ApiException.class)
         .hasFieldOrPropertyWithValue("status", HttpStatus.NOT_FOUND);
    }

    @Test
    void deleteLabel_deletesFromRepository() {
        when(labelRepository.findById(labelId)).thenReturn(Optional.of(label));

        labelService.deleteLabel(labelId, userId);

        verify(labelRepository).delete(label);
        verify(accessPolicy).assertAccess(boardId, userId, BoardAction.WRITE);
    }

    @Test
    void deleteLabel_throwsNotFoundWhenLabelMissing() {
        when(labelRepository.findById(labelId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> labelService.deleteLabel(labelId, userId))
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
