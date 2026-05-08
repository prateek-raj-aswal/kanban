package com.kanban.repository;

import com.kanban.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findActiveByEmail(String email);

    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    boolean existsActiveByEmail(String email);
}
