package com.codementor.ai.client;

import com.codementor.ai.dto.GitHubRepoDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Component
public class GitHubClient {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private static final String GITHUB_API_URL = "https://api.github.com";

    public GitHubClient() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        
        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
    }

    public List<GitHubRepoDTO> getUserRepositories(String pat) throws Exception {
        if (pat == null || pat.isBlank()) {
            throw new IllegalArgumentException("Personal Access Token cannot be blank for private user repos");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GITHUB_API_URL + "/user/repos?per_page=100&sort=updated"))
                .header("Authorization", "Bearer " + pat.trim())
                .header("Accept", "application/vnd.github.v3+json")
                .header("User-Agent", "CodeMentor-AI")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to fetch repositories from GitHub: " + response.body());
        }

        return objectMapper.readValue(response.body(), new TypeReference<List<GitHubRepoDTO>>() {});
    }

    public List<GitHubRepoDTO> getPublicRepositories(String username) throws Exception {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username cannot be blank");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GITHUB_API_URL + "/users/" + username.trim() + "/repos?per_page=100&sort=updated"))
                .header("Accept", "application/vnd.github.v3+json")
                .header("User-Agent", "CodeMentor-AI")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to fetch public repositories for @" + username + ": " + response.body());
        }

        return objectMapper.readValue(response.body(), new TypeReference<List<GitHubRepoDTO>>() {});
    }

    public byte[] downloadRepositoryZip(String pat, String owner, String repo, String branch) throws Exception {
        String targetBranch = (branch != null && !branch.isBlank()) ? branch.trim() : "main";
        
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(GITHUB_API_URL + "/repos/" + owner + "/" + repo + "/zipball/" + targetBranch))
                .header("Accept", "application/vnd.github.v3+json")
                .header("User-Agent", "CodeMentor-AI")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .GET();

        if (pat != null && !pat.isBlank()) {
            builder.header("Authorization", "Bearer " + pat.trim());
        }

        // followRedirects is enabled on the client, so it will automatically follow the 302 redirect to the zip download URL.
        HttpResponse<byte[]> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofByteArray());

        // Fallback to default branch zip if specific branch name returns 404
        if (response.statusCode() == 404) {
            HttpRequest.Builder retryBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(GITHUB_API_URL + "/repos/" + owner + "/" + repo + "/zipball"))
                    .header("Accept", "application/vnd.github.v3+json")
                    .header("User-Agent", "CodeMentor-AI")
                    .header("X-GitHub-Api-Version", "2022-11-28")
                    .GET();

            if (pat != null && !pat.isBlank()) {
                retryBuilder.header("Authorization", "Bearer " + pat.trim());
            }

            response = httpClient.send(retryBuilder.build(), HttpResponse.BodyHandlers.ofByteArray());
        }

        if (response.statusCode() != 200) {
            throw new RuntimeException("Failed to download repository zip: HTTP " + response.statusCode());
        }

        return response.body();
    }
}
