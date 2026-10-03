package com.codementor.ai.dto;

import lombok.Data;

@Data
public class GitHubConnectRequest {
    private String accessToken;
    private String githubUsername;
}
