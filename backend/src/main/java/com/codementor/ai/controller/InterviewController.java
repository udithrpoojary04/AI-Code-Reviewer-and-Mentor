package com.codementor.ai.controller;

import com.codementor.ai.client.GroqClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview")
@RequiredArgsConstructor
public class InterviewController {

    private final GroqClient groqClient;

    @GetMapping("/generate")
    public ResponseEntity<String> generateInterview(
            @RequestParam String language,
            @RequestParam String skillLevel,
            @RequestParam String type) {
        
        String interviewJson = groqClient.generateInterview(language, skillLevel, type);
        
        // Return raw JSON string, Spring will pass it through (ensure content type is application/json)
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(interviewJson);
    }
}
