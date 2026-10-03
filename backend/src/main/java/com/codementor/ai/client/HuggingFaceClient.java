package com.codementor.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Component
public class HuggingFaceClient {

    @Value("${ai.huggingface.url}")
    private String hfUrl;

    @Value("${ai.huggingface.api-key}")
    private String apiKey;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Using Mistral 7B Instruct which is highly capable and typically freely accessible
    private static final String MODEL_PATH = "mistralai/Mistral-7B-Instruct-v0.2";

    public HuggingFaceClient() {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public String generateContent(String prompt) {
        try {
            // Format for Hugging Face Inference API
            Map<String, Object> requestBodyMap = Map.of(
                "inputs", "[INST] " + prompt + " [/INST]",
                "parameters", Map.of(
                    "max_new_tokens", 800,
                    "temperature", 0.3,
                    "return_full_text", false
                )
            );

            String requestBody = objectMapper.writeValueAsString(requestBodyMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(hfUrl + MODEL_PATH))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                if (root.isArray() && root.size() > 0) {
                    JsonNode firstResult = root.get(0);
                    if (firstResult.has("generated_text")) {
                        return firstResult.get("generated_text").asText();
                    }
                }
                return getMockResponse();
            } else {
                String errorMsg = "Hugging Face API Error: " + response.statusCode() + " " + response.body();
                System.err.println(errorMsg);
                return "## Hugging Face API Error\n\n" + errorMsg;
            }
        } catch (Exception e) {
            String errorMsg = "Error communicating with Hugging Face API: " + e.toString();
            e.printStackTrace();
            System.err.println(errorMsg);
            return "## Hugging Face API Error\n\n" + errorMsg;
        }
    }

    private String getMockResponse() {
        return "## Mock Code Review Result\n\n" +
               "It looks like your Hugging Face API key is invalid or the model is still loading on Hugging Face servers. " +
               "This is a fallback response so you can still test the UI!\n\n" +
               "### Suggestions:\n" +
               "- Improve variable names.\n" +
               "- Add proper error handling.\n" +
               "- Optimize imports.\n\n" +
               "### Optimized Code:\n" +
               "```javascript\n" +
               "function calculateSum(a, b) {\n" +
               "  if (typeof a !== 'number' || typeof b !== 'number') return 0;\n" +
               "  return a + b;\n" +
               "}\n" +
               "```";
    }
}
