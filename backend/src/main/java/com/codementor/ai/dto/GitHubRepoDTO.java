package com.codementor.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GitHubRepoDTO {
    private String id;
    private String name;
    private String fullName;
    private String description;
    private String htmlUrl;
    private String defaultBranch;
    private String language;
}
