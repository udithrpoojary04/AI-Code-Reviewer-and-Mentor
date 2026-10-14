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

        // Deduplication: If user submits identical code, return existing review for consistency
        List<Review> userReviews = reviewRepository.findByUserOrderByCreatedAtDesc(user);
        if (!userReviews.isEmpty()) {
            Review latest = userReviews.get(0);
            List<ReviewHistory> latestHistory = reviewHistoryRepository.findByReviewOrderByCreatedAtDesc(latest);
            if (!latestHistory.isEmpty()) {
                String prevCode = latestHistory.get(0).getOriginalCode();
                if (prevCode != null && prevCode.trim().equals(request.getCode().trim())) {
                    return latest;
                }
            }
        }

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
            "CRITICAL: If the code has syntax errors, incomplete expressions (e.g. 'return a + ;'), or will not run, explicitly identify the exact syntax error and rate the code accordingly low.\n" +
            "Format the response in Markdown.\n\n" +
            "At the very end of your response, output a single line with numerical scores (0-100):\n" +
            "If the code has syntax errors, overall score MUST be below 40.\n" +
            "SCORES: overall=<number>, security=<number>, performance=<number>\n\n" +
            "Code:\n```%s\n%s\n```",
            language != null ? language : "programming",
            language != null ? language : "",
            code
        );
    }

    private int[] extractScores(String aiResponse, String code) {
        int overall = extractSingleScore(aiResponse, "overall");
        int security = extractSingleScore(aiResponse, "security");
        int performance = extractSingleScore(aiResponse, "performance");

        boolean hasSyntaxError = false;

        // 1. Inspect user code for obvious syntax breakage
        if (code != null) {
            String trimmed = code.trim();
            if (trimmed.contains("+ ;") || trimmed.contains("- ;") || trimmed.contains("* ;") 
                    || trimmed.contains("/ ;") || trimmed.contains("= ;") || trimmed.contains("return +")
                    || trimmed.contains("return -") || trimmed.contains("(,")) {
                hasSyntaxError = true;
            }
            long openB = trimmed.chars().filter(ch -> ch == '{').count();
            long closeB = trimmed.chars().filter(ch -> ch == '}').count();
            if (openB != closeB) {
                hasSyntaxError = true;
            }
        }

        // 2. Inspect AI response text for reported errors
        if (aiResponse != null) {
            String lowerAi = aiResponse.toLowerCase();
            if (lowerAi.contains("syntax error") || lowerAi.contains("parse error") 
                    || lowerAi.contains("unexpected token") || lowerAi.contains("incomplete expression")
                    || lowerAi.contains("will not compile") || lowerAi.contains("compilation error")
                    || lowerAi.contains("invalid syntax") || lowerAi.contains("critical defects detected")) {
                hasSyntaxError = true;
            }
        }

        // If code has critical syntax errors, cap scores heavily
        if (hasSyntaxError) {
            overall = (overall > 0 && overall < 45) ? overall : 32;
            security = (security > 0) ? Math.min(security, 75) : 70;
            performance = (performance > 0 && performance < 50) ? performance : 35;
            return new int[]{ overall, security, performance };
        }

        // Fallback calculations for clean or non-fatal code if scores couldn't be parsed
        if (overall < 0 || security < 0 || performance < 0) {
            int baseScore = 78;
            int secScore = 85;
            int perfScore = 80;

            if (code != null) {
                String lower = code.toLowerCase();
                if (lower.contains("eval(") || lower.contains("innerhtml") || lower.contains("password =") || lower.contains("exec(")) {
                    secScore -= 35;
                    baseScore -= 20;
                }
                if (lower.contains("select *") || lower.contains("drop table") || lower.contains("query = \"\" +")) {
                    secScore -= 25;
                    baseScore -= 15;
                }
                if (lower.contains("for (") && lower.indexOf("for (", lower.indexOf("for (") + 1) != -1) {
                    perfScore -= 20;
                }
                if (code.trim().length() < 30) {
                    baseScore -= 15;
                }
            }

            if (aiResponse != null) {
                String lowerAi = aiResponse.toLowerCase();
                if (lowerAi.contains("vulnerability") || lowerAi.contains("security risk") || lowerAi.contains("injection")) {
                    secScore = Math.min(secScore, 55);
                    baseScore = Math.min(baseScore, 65);
                }
                if (lowerAi.contains("inefficient") || lowerAi.contains("slow") || lowerAi.contains("o(n^2)") || lowerAi.contains("high complexity")) {
                    perfScore = Math.min(perfScore, 60);
                    baseScore = Math.min(baseScore, 70);
                }
            }

            overall = (overall > 0) ? overall : Math.max(25, Math.min(98, baseScore));
            security = (security > 0) ? security : Math.max(25, Math.min(99, secScore));
            performance = (performance > 0) ? performance : Math.max(25, Math.min(98, perfScore));
        }

        return new int[]{ overall, security, performance };
    }

    private int extractSingleScore(String text, String category) {
        if (text == null) return -1;
        // Patterns to match: overall=85, overall: 85, overall=[85], overall: 85/100, **Overall:** 85
        String regex = "(?i)(?:" + category + "|(?:\\*\\*" + category + "\\*\\*)|(?:#" + category + "))\\s*[:=]?\\s*\\[?\\s*(\\d{1,3})(?:\\s*[/\\\\]\\s*100|%|\\]|\\b)";
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(regex);
        java.util.regex.Matcher m = p.matcher(text);
        if (m.find()) {
            try {
                int val = Integer.parseInt(m.group(1));
                if (val >= 0 && val <= 100) return val;
            } catch (Exception ignored) {}
        }
        return -1;
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
