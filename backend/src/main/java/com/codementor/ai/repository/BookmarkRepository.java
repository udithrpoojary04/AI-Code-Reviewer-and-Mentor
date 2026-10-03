package com.codementor.ai.repository;

import com.codementor.ai.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Bookmark> findByUserIdAndTargetIdAndTargetType(UUID userId, UUID targetId, String targetType);
    boolean existsByUserIdAndTargetIdAndTargetType(UUID userId, UUID targetId, String targetType);
}
