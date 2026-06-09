package com.kanban.service;

import com.kanban.model.WorkspaceIdCounter;
import com.kanban.model.WorkspaceIdCounterId;
import com.kanban.repository.WorkspaceIdCounterRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** US-1605: ReadableIdService prefix mapping and zero-padding verification. */
@ExtendWith(MockitoExtension.class)
class ReadableIdServiceTest {

    @Mock WorkspaceIdCounterRepository counterRepository;
    @InjectMocks ReadableIdService readableIdService;

    private final UUID workspaceId = UUID.randomUUID();

    private WorkspaceIdCounter counterWith(int value) {
        WorkspaceIdCounter c = new WorkspaceIdCounter();
        c.setLastCounter(value);
        when(counterRepository.findByIdForUpdate(any(), any())).thenReturn(Optional.of(c));
        when(counterRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        return c;
    }

    @Test void story_type_uses_US_prefix() {
        counterWith(0);
        String id = readableIdService.allocate(workspaceId, "STORY");
        assertThat(id).startsWith("US-");
    }

    @Test void feature_type_uses_FEAT_prefix() {
        counterWith(0);
        String id = readableIdService.allocate(workspaceId, "FEATURE");
        assertThat(id).startsWith("FEAT-");
    }

    @Test void bug_type_uses_BUG_prefix() {
        counterWith(0);
        String id = readableIdService.allocate(workspaceId, "BUG");
        assertThat(id).startsWith("BUG-");
    }

    @Test void counter_1_formats_as_001() {
        counterWith(0);
        assertThat(readableIdService.allocate(workspaceId, "STORY")).isEqualTo("US-001");
    }

    @Test void counter_9_formats_as_009() {
        counterWith(8);
        assertThat(readableIdService.allocate(workspaceId, "STORY")).isEqualTo("US-009");
    }

    @Test void counter_99_formats_as_099() {
        counterWith(98);
        assertThat(readableIdService.allocate(workspaceId, "STORY")).isEqualTo("US-099");
    }

    @Test void counter_100_formats_as_100() {
        counterWith(99);
        assertThat(readableIdService.allocate(workspaceId, "STORY")).isEqualTo("US-100");
    }

    @Test void counter_999_formats_as_999() {
        counterWith(998);
        assertThat(readableIdService.allocate(workspaceId, "STORY")).isEqualTo("US-999");
    }

    @Test void no_existing_row_initialises_counter_to_1() {
        WorkspaceIdCounter fresh = new WorkspaceIdCounter();
        fresh.setLastCounter(0);
        when(counterRepository.findByIdForUpdate(any(), any())).thenReturn(Optional.of(fresh));
        when(counterRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String id = readableIdService.allocate(workspaceId, "BUG");
        assertThat(id).isEqualTo("BUG-001");
        verify(counterRepository).upsertIfAbsent(workspaceId, "BUG");
    }

    @Test void unknown_item_type_throws() {
        assertThatThrownBy(() -> readableIdService.allocate(workspaceId, "UNKNOWN"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
