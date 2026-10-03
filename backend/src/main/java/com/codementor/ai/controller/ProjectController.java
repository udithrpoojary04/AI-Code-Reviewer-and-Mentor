package com.codementor.ai.controller;

import com.codementor.ai.entity.Review;
import com.codementor.ai.service.ProjectUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProjectController {

    private final ProjectUploadService projectUploadService;

    @PostMapping("/upload")
    public ResponseEntity<Review> uploadProject(@RequestParam("file") MultipartFile file) throws Exception {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Review review = projectUploadService.uploadAndAnalyze(file, email);
        return ResponseEntity.ok(review);
    }
}
