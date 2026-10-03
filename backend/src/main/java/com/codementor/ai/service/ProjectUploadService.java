package com.codementor.ai.service;

import com.codementor.ai.entity.Review;
import com.codementor.ai.util.ZipUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProjectUploadService {

    private final CodeReviewService codeReviewService;

    public Review uploadAndAnalyze(MultipartFile file, String userEmail) throws Exception {
        if (file.isEmpty() || !file.getOriginalFilename().endsWith(".zip")) {
            throw new IllegalArgumentException("File must be a non-empty .zip file");
        }

        byte[] zipBytes = file.getBytes();
        Map<String, String> files = ZipUtils.extractCodeFiles(zipBytes);
        
        if (files.isEmpty()) {
            throw new IllegalArgumentException("No valid code files found in the zip archive.");
        }

        String projectName = file.getOriginalFilename().replace(".zip", "");
        return codeReviewService.analyzeProject(files, userEmail, projectName);
    }
}
