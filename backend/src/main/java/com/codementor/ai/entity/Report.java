package com.codementor.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String reportType; // SKILL_REPORT, REVIEW_REPORT, etc.

    @Column(nullable = false)
    private String format; // PDF, CSV

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contentUrl; // URL or path to the exported file

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedAt;
}
