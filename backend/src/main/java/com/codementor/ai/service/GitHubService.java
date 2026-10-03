package com.codementor.ai.service;

import com.codementor.ai.client.GitHubClient;
import com.codementor.ai.dto.GitHubConnectRequest;
import com.codementor.ai.dto.GitHubRepoDTO;
import com.codementor.ai.dto.GitHubAnalyzeRequest;
import com.codementor.ai.entity.GitHubAccount;
import com.codementor.ai.entity.Review;
import com.codementor.ai.entity.User;
import com.codementor.ai.repository.GitHubAccountRepository;
import com.codementor.ai.repository.UserRepository;
import com.codementor.ai.util.ZipUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GitHubService {

    private final GitHubAccountRepository gitHubAccountRepository;
    private final UserRepository userRepository;
    private final GitHubClient gitHubClient;
    private final CodeReviewService codeReviewService;

    @Transactional
    public void connectAccount(GitHubConnectRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GitHubAccount account = gitHubAccountRepository.findByUserId(user.getId())
                .orElse(new GitHubAccount());

        account.setUser(user);
        account.setAccessToken(request.getAccessToken() != null ? request.getAccessToken().trim() : "");
        account.setGithubUsername(request.getGithubUsername() != null ? request.getGithubUsername().trim() : "");

        gitHubAccountRepository.save(account);
    }

    @Transactional
    public void disconnectAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        gitHubAccountRepository.findByUserId(user.getId()).ifPresent(gitHubAccountRepository::delete);
    }

    public List<GitHubRepoDTO> getRepositories() throws Exception {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GitHubAccount account = gitHubAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("GitHub account not connected"));

        if (account.getAccessToken() != null && !account.getAccessToken().isBlank()) {
            try {
                return gitHubClient.getUserRepositories(account.getAccessToken());
            } catch (Exception e) {
                // If token fails or is expired/invalid, automatically fallback to public repos by username
                return gitHubClient.getPublicRepositories(account.getGithubUsername());
            }
        }
        return gitHubClient.getPublicRepositories(account.getGithubUsername());
    }

    public List<GitHubRepoDTO> getPublicRepositories(String username) throws Exception {
        return gitHubClient.getPublicRepositories(username);
    }
    
    public GitHubAccount getCurrentUserAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return gitHubAccountRepository.findByUserId(user.getId()).orElse(null);
    }

    public Review analyzeRepository(GitHubAnalyzeRequest request) throws Exception {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GitHubAccount account = gitHubAccountRepository.findByUserId(user.getId()).orElse(null);
        String token = (account != null && account.getAccessToken() != null && !account.getAccessToken().isBlank())
                ? account.getAccessToken()
                : null;

        byte[] zipBytes = gitHubClient.downloadRepositoryZip(token, request.getOwner(), request.getRepo(), request.getBranch());
        
        Map<String, String> files = ZipUtils.extractCodeFiles(zipBytes);
        
        return codeReviewService.analyzeProject(files, email, request.getRepo());
    }
}
