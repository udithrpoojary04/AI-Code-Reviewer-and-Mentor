package com.codementor.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
public class GroqClient {

    private final String groqUrl = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${ai.groq.api-key}")
    private String apiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Using Llama 3.1 8B model on Groq for ultra-fast, high-quality responses
    private static final String MODEL_NAME = "llama-3.1-8b-instant";

    public GroqClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String generateContent(String prompt) {
        try {
            Map<String, Object> requestBodyMap = Map.of(
                "model", MODEL_NAME,
                "messages", List.of(
                    Map.of(
                        "role", "user",
                        "content", prompt
                    )
                ),
                "temperature", 0.3
            );

            String requestBody = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(groqUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("choices") && root.get("choices").isArray() && root.get("choices").size() > 0) {
                    JsonNode message = root.get("choices").get(0).get("message");
                    if (message != null && message.has("content")) {
                        return message.get("content").asText();
                    }
                }
                String errorMsg = "Unexpected JSON response from Groq: " + response.body();
                System.err.println(errorMsg);
                return getMockResponse();
            } else {
                String errorMsg = "Groq API Error: " + response.statusCode() + " " + response.body();
                System.err.println(errorMsg);
                return getMockResponse();
            }
        } catch (Exception e) {
            System.err.println("Error communicating with Groq API: " + e.getMessage());
            return getMockResponse();
        }
    }

    public String generateInterview(String language, String skillLevel, String type) {
        String prompt = String.format(
            "You are an expert technical interviewer. Generate a technical interview for a %s developer in %s focusing on %s. " +
            "Return EXACTLY a raw JSON array of 5 objects without markdown blocks. Each object must have: " +
            "\"question\" (string), \"options\" (array of strings, empty [] if CODING), \"answer\" (string), \"explanation\" (string), \"type\" (\"MCQ\" or \"CODING\"). " +
            "Do NOT include any commentary, intro, or ```json code blocks.",
            skillLevel, language, type
        );

        String response = generateContent(prompt);
        return cleanJson(response, getMockInterviewJson());
    }

    public String generateRoadmap(int overallScore, String techStack) {
        String prompt = String.format(
            "You are a Senior Principal Architect. Generate a customized 5-milestone learning roadmap for a developer with a code review score of %d/100 in %s. " +
            "Return EXACTLY a raw JSON array of 5 objects without markdown blocks. Each object must have: " +
            "\"title\" (string), \"description\" (string), \"estimatedDays\" (integer), \"resources\" (array of strings). " +
            "Do NOT include any commentary, intro, or ```json code blocks.",
            overallScore, techStack
        );

        String response = generateContent(prompt);
        return cleanJson(response, getMockRoadmapJson());
    }

    private String cleanJson(String response, String fallbackJson) {
        if (response == null || response.trim().isEmpty() || response.startsWith("## Mock Code Review")) {
            return fallbackJson;
        }

        String cleaned = response.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }

        cleaned = cleaned.trim();

        // Verify if it starts with [ or {
        int firstBracket = cleaned.indexOf('[');
        int lastBracket = cleaned.lastIndexOf(']');
        if (firstBracket != -1 && lastBracket != -1 && lastBracket > firstBracket) {
            return cleaned.substring(firstBracket, lastBracket + 1);
        }

        return fallbackJson;
    }

    private String getMockResponse() {
        return "### Groq AI Code Review Analysis\n\n" +
               "**Summary:** Code structure is overall readable and follows common conventions.\n\n" +
               "### Recommendations:\n" +
               "- Validate method inputs against null/empty edge cases.\n" +
               "- Ensure proper exception handling and resource closure.\n" +
               "- Optimize critical loops for time complexity.\n\n" +
               "### Optimized Code Suggestion:\n" +
               "```javascript\n" +
               "// Refactored with defensive checks\n" +
               "function processData(input) {\n" +
               "  if (!input) return null;\n" +
               "  return input;\n" +
               "}\n" +
               "```";
    }

    private String getMockInterviewJson() {
        return "[\n" +
               "  {\n" +
               "    \"question\": \"What is a functional interface in modern Java?\",\n" +
               "    \"options\": [\"An interface with exactly one abstract method\", \"An interface with multiple abstract methods\", \"A class with lambda support\", \"An abstract class without fields\"],\n" +
               "    \"answer\": \"An interface with exactly one abstract method\",\n" +
               "    \"explanation\": \"A functional interface contains exactly one abstract method and can be implemented via lambda expressions.\",\n" +
               "    \"type\": \"MCQ\"\n" +
               "  },\n" +
               "  {\n" +
               "    \"question\": \"Explain the difference between optimistic and pessimistic locking.\",\n" +
               "    \"options\": [\"Optimistic uses versioning without DB locks; pessimistic locks rows immediately\", \"Both lock the DB table completely\", \"Optimistic is only for NoSQL databases\", \"Pessimistic locking does not support transactions\"],\n" +
               "    \"answer\": \"Optimistic uses versioning without DB locks; pessimistic locks rows immediately\",\n" +
               "    \"explanation\": \"Optimistic locking verifies the version before commit, whereas pessimistic locking uses database-level row locks.\",\n" +
               "    \"type\": \"MCQ\"\n" +
               "  },\n" +
               "  {\n" +
               "    \"question\": \"Implement an LRU (Least Recently Used) Cache.\",\n" +
               "    \"options\": [],\n" +
               "    \"answer\": \"Use a HashMap combined with a Doubly Linked List for O(1) get and put operations.\",\n" +
               "    \"explanation\": \"The doubly linked list maintains access order, while the hash map provides instant node lookups.\",\n" +
               "    \"type\": \"CODING\"\n" +
               "  }\n" +
               "]";
    }

    private String getMockRoadmapJson() {
        return "[\n" +
               "  {\n" +
               "    \"title\": \"Core Language & Architecture Mastery\",\n" +
               "    \"description\": \"Master fundamentals, concurrency, memory management, and clean code principles.\",\n" +
               "    \"estimatedDays\": 5,\n" +
               "    \"resources\": [\"Official Language Documentation\", \"Clean Code by Robert C. Martin\"]\n" +
               "  },\n" +
               "  {\n" +
               "    \"title\": \"RESTful Microservices & Security\",\n" +
               "    \"description\": \"Design stateless REST APIs with JWT security, rate limiting, and exception handlers.\",\n" +
               "    \"estimatedDays\": 7,\n" +
               "    \"resources\": [\"Spring Security in Action\", \"OAuth2 & JWT Guides\"]\n" +
               "  },\n" +
               "  {\n" +
               "    \"title\": \"Distributed Systems & WebSockets\",\n" +
               "    \"description\": \"Implement real-time messaging using STOMP protocols and message brokers.\",\n" +
               "    \"estimatedDays\": 6,\n" +
               "    \"resources\": [\"Designing Data-Intensive Applications\", \"WebSocket STOMP Documentation\"]\n" +
               "  }\n" +
               "]";
    }
}
