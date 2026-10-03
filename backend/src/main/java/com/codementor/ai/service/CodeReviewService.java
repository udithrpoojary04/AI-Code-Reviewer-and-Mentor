package com.codementor.ai.service;

import com.codementor.ai.client.GroqClient;
import com.codementor.ai.dto.CodeReviewRequest;
import com.codementor.ai.entity.Review;
import com.codementor.ai.entity.ReviewHistory;
import com.codementor.ai.entity.User;
import com.codementor.ai.repository.ReviewHistoryRepository;
import com.codementor.ai.repository.ReviewRepository;
import com.codementor.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CodeReviewService {

    private final GroqClient groqClient;
    private final ReviewRepository reviewRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public Review performReview(CodeReviewRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String prompt = buildPrompt(request.getCode(), request.getLanguage());
        String aiResponse = groqClient.generateContent(prompt);

        int[] scores = extractScores(aiResponse, request.getCode());
        int overallScore = scores[0];
        int secScore = scores[1];
        int perfScore = scores[2];
        String severity = extractSeverityLevel(overallScore, secScore);

        Review review = Review.builder()
                .user(user)
                .title(request.getTitle() != null && !request.getTitle().isEmpty() ? request.getTitle() : "Code Review - " + request.getLanguage())
                .aiSummary(aiResponse)
                .score(overallScore)
                .securityScore(secScore)
                .performanceScore(perfScore)
                .build();
                
        review = reviewRepository.save(review);

        ReviewHistory history = ReviewHistory.builder()
                .review(review)
                .originalCode(request.getCode())
                .optimizedCode(extractOptimizedCode(aiResponse))
                .feedback(aiResponse)
                .severityLevel(severity)
                .build();
                
        reviewHistoryRepository.save(history);

        return review;
    }

    @Transactional
    public Review analyzeProject(java.util.Map<String, String> files, String userEmail, String projectName) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are a Senior Software Architect. Review the following project codebase.\n");
        promptBuilder.append("Provide a high-level architectural summary, identify any security vulnerabilities, ");
        promptBuilder.append("and point out major code smells or design flaws.\n");
        promptBuilder.append("At the very end of your response, output a single line with numerical scores (0-100):\n");
        promptBuilder.append("SCORES: overall=[0-100], security=[0-100], performance=[0-100]\n\n");

        for (java.util.Map.Entry<String, String> entry : files.entrySet()) {
            promptBuilder.append("File: ").append(entry.getKey()).append("\n");
            String content = entry.getValue();
            // Truncate overly long files to fit Groq context window comfortably
            if (content.length() > 2500) {
                content = content.substring(0, 2500) + "\n// ... [truncated for review summary]";
            }
            promptBuilder.append("```\n").append(content).append("\n```\n\n");
        }

        // Use Groq API (Llama 3.1) for project review
        String aiResponse = groqClient.generateContent(promptBuilder.toString());

        int[] scores = extractScores(aiResponse, promptBuilder.toString());
        int overallScore = scores[0];
        int secScore = scores[1];
        int perfScore = scores[2];
        String severity = extractSeverityLevel(overallScore, secScore);

        Review review = Review.builder()
                .user(user)
                .title(projectName != null ? "Project Review: " + projectName : "Project Review")
                .aiSummary(aiResponse)
                .score(overallScore)
                .securityScore(secScore)
                .performanceScore(perfScore)
                .build();
                
        review = reviewRepository.save(review);

        ReviewHistory history = ReviewHistory.builder()
                .review(review)
                .originalCode("MULTIPLE FILES (" + files.size() + " files)")
                .optimizedCode("See summary for architectural recommendations.")
                .feedback(aiResponse)
                .severityLevel(severity)
                .build();
                
        reviewHistoryRepository.save(history);

        return review;
    }

    public List<Review> getUserReviews(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return reviewRepository.findByUserOrderByCreatedAtDesc(user);
    }

    private String buildPrompt(String code, String language) {
        return String.format(
            "You are a Senior Software Architect and expert in %s. " +
            "Review the following code for Readability, Maintainability, Performance, Security, and Best Practices. " +
            "Provide a summary, line-by-line feedback, and an optimized version of the code. " +
            "Format the response beautifully in Markdown.\n\n" +
            "At the very end of your response, output a single line with numerical scores (0-100) reflecting this code's quality:\n" +
            "SCORES: overall=[0-100], security=[0-100], performance=[0-100]\n\n" +
            "Code:\n```%s\n%s\n```",
            language != null ? language : "programming",
            language != null ? language : "",
            code
        );
    }

    private int[] extractScores(String aiResponse, String code) {
        int overall = -1;
        int security = -1;
        int performance = -1;

        if (aiResponse != null) {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(
                "(?i)SCORES?:?\\s*(?:overall[:=]\\s*(\\d+))[\\s,;|]+(?:security[:=]\\s*(\\d+))[\\s,;|]+(?:performance[:=]\\s*(\\d+))"
            );
            java.util.regex.Matcher m = p.matcher(aiResponse);
            if (m.find()) {
                try {
                    overall = Integer.parseInt(m.group(1));
                    security = Integer.parseInt(m.group(2));
                    performance = Integer.parseInt(m.group(3));
                } catch (Exception ignored) {}
            }
        }

        if (overall < 0 || security < 0 || performance < 0) {
            int baseScore = 86;
            int secScore = 90;
            int perfScore = 84;

            if (code != null) {
                String lower = code.toLowerCase();
                if (lower.contains("eval(") || lower.contains("innerhtml") || lower.contains("password =") || lower.contains("exec(")) {
                    secScore -= 30;
                    baseScore -= 15;
                }
                if (lower.contains("select *") || lower.contains("drop table") || lower.contains("query = \"\" +")) {
                    secScore -= 20;
                    baseScore -= 10;
                }
                if (lower.contains("for (") && lower.indexOf("for (", lower.indexOf("for (") + 1) != -1) {
                    perfScore -= 15;
                }
                if (code.trim().length() < 30) {
                    baseScore -= 10;
                }
            }

            if (aiResponse != null) {
                String lowerAi = aiResponse.toLowerCase();
                if (lowerAi.contains("vulnerability") || lowerAi.contains("security risk") || lowerAi.contains("injection")) {
                    secScore = Math.min(secScore, 60);
                    baseScore = Math.min(baseScore, 70);
                }
                if (lowerAi.contains("inefficient") || lowerAi.contains("slow") || lowerAi.contains("o(n^2)") || lowerAi.contains("high complexity")) {
                    perfScore = Math.min(perfScore, 65);
                    baseScore = Math.min(baseScore, 75);
                }
            }

            overall = Math.max(20, Math.min(98, baseScore));
            security = Math.max(20, Math.min(99, secScore));
            performance = Math.max(20, Math.min(98, perfScore));
        }

        return new int[]{ overall, security, performance };
    }

    private String extractSeverityLevel(int overall, int security) {
        if (security < 65 || overall < 55) return "HIGH";
        if (security < 82 || overall < 75) return "MEDIUM";
        return "LOW";
    }

    private String extractOptimizedCode(String aiResponse) {
        // Fallback simple extraction logic
        if (aiResponse == null) return "";
        int start = aiResponse.lastIndexOf("```");
        if (start != -1) {
            int blockStart = aiResponse.lastIndexOf("```", start - 1);
            if (blockStart != -1) {
                return aiResponse.substring(blockStart, start + 3);
            }
        }
        return "No optimized code block found.";
    }
}
