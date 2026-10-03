package com.codementor.ai.controller;

import com.codementor.ai.entity.enums.Role;
import com.codementor.ai.entity.User;
import com.codementor.ai.repository.ReviewRepository;
import com.codementor.ai.repository.UserRepository;
import com.codementor.ai.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final JwtService jwtService;

    @GetMapping("/promote-me")
    public ResponseEntity<String> promoteMe(@RequestHeader("Authorization") String token) {
        String email = jwtService.extractUsername(token.substring(7));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.ADMIN);
        userRepository.save(user);
        return ResponseEntity.ok("You are now an ADMIN. Please login again to get a new token.");
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalReviews = reviewRepository.count();
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalReviews", totalReviews);
        // Can add more stats here in the future
        
        return ResponseEntity.ok(stats);
    }
}
