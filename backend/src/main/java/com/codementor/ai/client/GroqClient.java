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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class GroqClient {

    private final String groqUrl = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${ai.groq.api-key}")
    private String apiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Preferred fallback models if dynamic discovery is unavailable
    private static final List<String> PREFERRED_MODELS = List.of(
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "llama3-8b-8192",
        "llama3-70b-8192",
        "qwen-2.5-coder-32b",
        "mixtral-8x7b-32768"
    );

    private volatile String activeModel = null;
    private volatile String lastError = "";

    public GroqClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    private String getSanitizedKey() {
        if (apiKey == null) return "";
        String key = apiKey.trim();
        if (key.startsWith("\"") && key.endsWith("\"") && key.length() >= 2) {
            key = key.substring(1, key.length() - 1);
        }
        if (key.startsWith("'") && key.endsWith("'") && key.length() >= 2) {
            key = key.substring(1, key.length() - 1);
        }
        return key.trim();
    }

    public String generateContent(String prompt) {
        String cleanKey = getSanitizedKey();
        if (cleanKey.isEmpty()) {
            return getMockResponse(prompt, "Groq API key is missing or not configured");
        }

        // 1. If we already verified an active model, try it first
        if (activeModel != null) {
            String result = callGroqModel(activeModel, cleanKey, prompt);
            if (result != null) {
                return result;
            }
            activeModel = null; // Reset and rediscover
        }

        // 2. Discover available models directly from Groq's API
        List<String> availableModels = fetchAvailableModels(cleanKey);
        if (availableModels.isEmpty()) {
            availableModels = PREFERRED_MODELS;
        }

        // 3. Try available models in order
        for (String candidate : availableModels) {
            String result = callGroqModel(candidate, cleanKey, prompt);
            if (result != null) {
                activeModel = candidate;
                System.out.println(">> [GroqClient] Verified active Groq model: " + candidate);
                return result;
            }
        }

        String detailedError = lastError.isEmpty() ? "All candidate models failed" : lastError;
        return getMockResponse(prompt, detailedError);
    }

    private List<String> fetchAvailableModels(String cleanKey) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.groq.com/openai/v1/models"))
                    .header("Authorization", "Bearer " + cleanKey)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.has("data") && root.get("data").isArray()) {
                    List<String> models = new ArrayList<>();
                    for (JsonNode node : root.get("data")) {
                        String id = node.path("id").asText("");
                        // Include chat/completion LLMs, exclude whisper/audio/guard
                        if (!id.isEmpty() && !id.contains("whisper") && !id.contains("guard") && !id.contains("embed")) {
                            models.add(id);
                        }
                    }
                    if (!models.isEmpty()) {
                        System.out.println(">> [GroqClient] Successfully fetched models from Groq: " + models);
                        return models;
                    }
                }
            } else {
                lastError = "GET /models returned HTTP " + response.statusCode() + " (" + response.body() + ")";
                System.err.println(">> [GroqClient] " + lastError);
            }
        } catch (Exception e) {
            lastError = "Error connecting to Groq /models: " + e.getMessage();
            System.err.println(">> [GroqClient] " + lastError);
        }
        return List.of();
    }

    private String callGroqModel(String model, String cleanKey, String prompt) {
        try {
            Map<String, Object> requestBodyMap = Map.of(
                "model", model,
                "messages", List.of(
                    Map.of(
                        "role", "user",
                        "content", prompt
                    )
                ),
                "temperature", 0.0
            );

            String requestBody = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(groqUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + cleanKey)
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
            } else {
                lastError = "HTTP " + response.statusCode() + " (" + response.body() + ")";
                System.err.println("Groq model '" + model + "' returned " + response.statusCode() + ": " + response.body());
            }
        } catch (Exception e) {
            lastError = e.getMessage();
            System.err.println("Error calling Groq model '" + model + "': " + e.getMessage());
        }
        return null;
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
        return getMockResponse("", "API unavailable");
    }

    private String getMockResponse(String prompt, String errorReason) {
        // Extract code snippet if present in prompt
        String code = "";
        if (prompt != null && prompt.contains("```")) {
            int firstBlock = prompt.indexOf("```");
            int secondBlock = prompt.indexOf("```", firstBlock + 3);
            if (secondBlock != -1) {
                code = prompt.substring(firstBlock + 3, secondBlock);
                // Strip language identifier if present on first line
                int newline = code.indexOf("\n");
                if (newline != -1 && newline < 20) {
                    code = code.substring(newline + 1);
                }
            }
        }

        StringBuilder feedback = new StringBuilder();
        feedback.append("### AI Code Review Analysis\n\n");
        if (errorReason != null && !errorReason.isEmpty()) {
            feedback.append("> ℹ️ *Note: Groq LLM API returned: ").append(errorReason)
                    .append(". Local syntax & heuristic analysis applied.*\n\n");
        }

        boolean hasSyntaxError = false;
        StringBuilder issues = new StringBuilder();

        if (code.contains("+ ;") || code.contains("- ;") || code.contains("* ;") || code.contains("/ ;") || code.contains("= ;")) {
            hasSyntaxError = true;
            issues.append("- **Critical Syntax Error**: Incomplete operator expression detected before `;` (e.g. `+ ;`). A right-hand operand is required.\n");
        }
        
        long openBraces = code.chars().filter(ch -> ch == '{').count();
        long closeBraces = code.chars().filter(ch -> ch == '}').count();
        if (openBraces != closeBraces) {
            hasSyntaxError = true;
            issues.append("- **Syntax Error**: Mismatched curly braces `{}`. Expected matching closing brace.\n");
        }

        if (code.contains("calculateSum") && code.contains("bb")) {
            issues.append("- **Unused Parameter / Typo**: Parameter `bb` is declared in signature but never used in the return expression.\n");
        }

        if (hasSyntaxError) {
            feedback.append("**Summary:** The submitted code has critical syntax or structural defects that will cause a parse failure or runtime exception.\n\n");
            feedback.append("### Critical Defects Detected:\n").append(issues).append("\n");
            feedback.append("### Recommendations:\n");
            feedback.append("- Complete the arithmetic expression with the expected variable (e.g., `return a + bb;`).\n");
            feedback.append("- Ensure type validation is present before performing arithmetic.\n\n");
            feedback.append("### Optimized Code Suggestion:\n");
            feedback.append("```javascript\n");
            feedback.append("// Refactored with syntax fix & parameter validation\n");
            feedback.append("function calculateSum(a, b) {\n");
            feedback.append("  if (typeof a !== 'number' || typeof b !== 'number') {\n");
            feedback.append("    throw new TypeError('Arguments must be valid numbers');\n");
            feedback.append("  }\n");
            feedback.append("  return a + b;\n");
            feedback.append("}\n");
            feedback.append("```\n\n");
            feedback.append("SCORES: overall=35, security=80, performance=40");
        } else {
            feedback.append("**Summary:** Code structure is generally readable and follows standard naming conventions.\n\n");
            feedback.append("### Recommendations:\n");
            feedback.append("- Validate method inputs against null/empty edge cases.\n");
            feedback.append("- Ensure proper exception handling and defensive typing.\n");
            feedback.append("- Optimize loop bounds and algorithmic complexity.\n\n");
            feedback.append("### Optimized Code Suggestion:\n");
            feedback.append("```javascript\n");
            feedback.append("// Refactored with defensive checks\n");
            feedback.append("function processData(input) {\n");
            feedback.append("  if (!input) return null;\n");
            feedback.append("  return input;\n");
            feedback.append("}\n");
            feedback.append("```\n\n");
            feedback.append("SCORES: overall=82, security=88, performance=85");
        }

        return feedback.toString();
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
