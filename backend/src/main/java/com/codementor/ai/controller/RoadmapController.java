package com.codementor.ai.controller;

import com.codementor.ai.client.GroqClient;
import com.codementor.ai.entity.Review;
import com.codementor.ai.entity.User;
import com.codementor.ai.repository.ReviewRepository;
import com.codementor.ai.repository.UserRepository;
import com.codementor.ai.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final GroqClient groqClient;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping("/generate")
    public ResponseEntity<String> generateRoadmap(
            @RequestHeader("Authorization") String token,
            @RequestParam String techStack) {
        
        String email = jwtService.extractUsername(token.substring(7));
        User user = userRepository.findByEmail(email).orElseThrow();
        
        List<Review> pastReviews = reviewRepository.findByUserOrderByCreatedAtDesc(user);
        
        int averageScore = 50; // Default if no reviews
        if (!pastReviews.isEmpty()) {
            averageScore = pastReviews.stream()
                .mapToInt(Review::getScore)
                .sum() / pastReviews.size();
        }

        String roadmapJson = groqClient.generateRoadmap(averageScore, techStack);
        
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(roadmapJson);
    }
}
