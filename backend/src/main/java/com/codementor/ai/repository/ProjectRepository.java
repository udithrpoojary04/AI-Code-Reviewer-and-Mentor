package com.codementor.ai.repository;

import com.codementor.ai.entity.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Repository
public interface ProjectRepository extends JpaRepository<Repository, UUID> {
    List<Repository> findByUserId(UUID userId);
}
