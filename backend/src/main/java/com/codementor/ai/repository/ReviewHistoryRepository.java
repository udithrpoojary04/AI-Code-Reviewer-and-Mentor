package com.codementor.ai.repository;

import com.codementor.ai.entity.Review;
import com.codementor.ai.entity.ReviewHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewHistoryRepository extends JpaRepository<ReviewHistory, UUID> {
    List<ReviewHistory> findByReviewOrderByCreatedAtDesc(Review review);
}
