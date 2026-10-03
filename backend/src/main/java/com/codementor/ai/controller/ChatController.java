package com.codementor.ai.controller;

import com.codementor.ai.client.GroqClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final GroqClient groqClient;

    @PostMapping
    public ResponseEntity<String> chat(@RequestBody ChatRequest request) {
        String prompt = "You are a helpful AI Coding Mentor. Keep answers concise, technical, and helpful. " +
                        "User says: " + request.getMessage();
        
        String response = groqClient.generateContent(prompt);
        return ResponseEntity.ok(response);
    }

    public static class ChatRequest {
        private String message;
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
