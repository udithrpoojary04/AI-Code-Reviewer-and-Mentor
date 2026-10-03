package com.codementor.ai.controller;

import com.codementor.ai.dto.ApiResponse;
import com.codementor.ai.dto.CodeReviewRequest;
import com.codementor.ai.entity.Review;
import com.codementor.ai.service.CodeReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class CodeReviewController {

    private final CodeReviewService codeReviewService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<Review>> analyzeCode(
            @Valid @RequestBody CodeReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Review review = codeReviewService.performReview(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(review, "Code review completed successfully"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Review>>> getReviewHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<Review> reviews = codeReviewService.getUserReviews(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(reviews, "Review history fetched successfully"));
    }
}
