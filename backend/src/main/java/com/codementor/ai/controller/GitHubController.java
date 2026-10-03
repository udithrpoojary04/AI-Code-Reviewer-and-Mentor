package com.codementor.ai.controller;

import com.codementor.ai.dto.ApiResponse;
import com.codementor.ai.dto.GitHubAnalyzeRequest;
import com.codementor.ai.dto.GitHubConnectRequest;
import com.codementor.ai.dto.GitHubRepoDTO;
import com.codementor.ai.entity.GitHubAccount;
import com.codementor.ai.entity.Review;
import com.codementor.ai.service.GitHubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/github")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class GitHubController {

    private final GitHubService gitHubService;

    @PostMapping("/connect")
    public ResponseEntity<ApiResponse<Void>> connectAccount(@RequestBody GitHubConnectRequest request) {
        gitHubService.connectAccount(request);
        return ResponseEntity.ok(ApiResponse.success(null, "GitHub account connected successfully"));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Void>> getStatus() {
        GitHubAccount account = gitHubService.getCurrentUserAccount();
        if (account != null) {
            return ResponseEntity.ok(ApiResponse.success(null, "Connected as " + account.getGithubUsername()));
        } else {
            return ResponseEntity.ok(ApiResponse.error("Not connected", HttpStatus.OK));
        }
    }

    @PostMapping("/disconnect")
    public ResponseEntity<ApiResponse<Void>> disconnectAccount() {
        gitHubService.disconnectAccount();
        return ResponseEntity.ok(ApiResponse.success(null, "GitHub account disconnected"));
    }

    @GetMapping("/public-repos")
    public ResponseEntity<List<GitHubRepoDTO>> getPublicRepositories(@RequestParam String username) throws Exception {
        return ResponseEntity.ok(gitHubService.getPublicRepositories(username));
    }

    @GetMapping("/repos")
    public ResponseEntity<List<GitHubRepoDTO>> getRepositories() throws Exception {
        return ResponseEntity.ok(gitHubService.getRepositories());
    }

    @PostMapping("/analyze")
    public ResponseEntity<Review> analyzeRepository(@RequestBody GitHubAnalyzeRequest request) throws Exception {
        Review review = gitHubService.analyzeRepository(request);
        return ResponseEntity.ok(review);
    }
}
