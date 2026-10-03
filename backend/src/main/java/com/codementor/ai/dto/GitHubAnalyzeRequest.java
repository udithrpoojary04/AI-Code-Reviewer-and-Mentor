package com.codementor.ai.dto;

import lombok.Data;

@Data
public class GitHubAnalyzeRequest {
    private String owner;
    private String repo;
    private String branch;
}
