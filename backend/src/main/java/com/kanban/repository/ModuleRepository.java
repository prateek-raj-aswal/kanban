package com.kanban.repository;

import com.kanban.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ModuleRepository extends JpaRepository<Module, UUID> {
    List<Module> findAllByBoard_Id(UUID boardId);
}
