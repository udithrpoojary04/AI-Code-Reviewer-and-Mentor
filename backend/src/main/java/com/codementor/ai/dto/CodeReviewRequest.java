package com.codementor.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CodeReviewRequest {

    @NotBlank(message = "Code content cannot be empty")
    private String code;

    private String language;
    private String title;
}
