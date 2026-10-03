package com.codementor.ai.client;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * GeminiClient delegates all requests to GroqClient to ensure
 * high performance and unified AI processing across the platform.
 */
@Component
@RequiredArgsConstructor
public class GeminiClient {

    private final GroqClient groqClient;

    public String generateContent(String prompt) {
        return groqClient.generateContent(prompt);
    }

    public String generateInterview(String language, String skillLevel, String type) {
        return groqClient.generateInterview(language, skillLevel, type);
    }

    public String generateRoadmap(int overallScore, String techStack) {
        return groqClient.generateRoadmap(overallScore, techStack);
    }
}
