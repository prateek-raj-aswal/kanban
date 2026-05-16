package com.kanban.service;

import com.kanban.dto.response.ActivityLogResponse;
import com.kanban.model.ActivityLog;
import com.kanban.model.User;
import com.kanban.repository.ActivityLogRepository;
import com.kanban.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void record(UUID boardId, UUID cardId, UUID actorId, String eventType, String summary) {
        ActivityLog log = new ActivityLog();
        log.setBoardId(boardId);
        log.setCardId(cardId);
        log.setActorId(actorId);
        log.setEventType(eventType);
        log.setSummary(summary);
        activityLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getCardActivity(UUID cardId) {
        List<ActivityLog> logs = activityLogRepository.findByCardIdOrderByCreatedAtDesc(cardId, PageRequest.of(0, 50));
        return toResponses(logs);
    }

    @Transactional(readOnly = true)
    public List<ActivityLogResponse> getBoardActivity(UUID boardId) {
        List<ActivityLog> logs = activityLogRepository.findByBoardIdOrderByCreatedAtDesc(boardId, PageRequest.of(0, 100));
        return toResponses(logs);
    }

    private List<ActivityLogResponse> toResponses(List<ActivityLog> logs) {
        Set<UUID> actorIds = logs.stream()
                .filter(l -> l.getActorId() != null)
                .map(ActivityLog::getActorId)
                .collect(Collectors.toSet());
        Map<UUID, String> names = userRepository.findAllById(actorIds)
                .stream().collect(Collectors.toMap(User::getId, User::getDisplayName));
        return logs.stream().map(l -> new ActivityLogResponse(
                l.getId(), l.getBoardId(), l.getCardId(), l.getActorId(),
                l.getActorId() != null ? names.getOrDefault(l.getActorId(), "Unknown") : null,
                l.getEventType(), l.getSummary(), l.getCreatedAt()
        )).toList();
    }
}
