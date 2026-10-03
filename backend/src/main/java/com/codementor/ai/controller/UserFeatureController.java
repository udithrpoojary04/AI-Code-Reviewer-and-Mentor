package com.codementor.ai.controller;

import com.codementor.ai.entity.Bookmark;
import com.codementor.ai.entity.Notification;
import com.codementor.ai.repository.UserRepository;
import com.codementor.ai.security.JwtService;
import com.codementor.ai.service.BookmarkService;
import com.codementor.ai.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserFeatureController {

    private final BookmarkService bookmarkService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    private UUID getUserId(String token) {
        String email = jwtService.extractUsername(token.substring(7));
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<List<Bookmark>> getBookmarks(@RequestHeader("Authorization") String token) {
        UUID userId = getUserId(token);
        return ResponseEntity.ok(bookmarkService.getUserBookmarks(userId));
    }

    @PostMapping("/bookmarks/toggle")
    public ResponseEntity<?> toggleBookmark(
            @RequestHeader("Authorization") String token,
            @RequestParam UUID targetId,
            @RequestParam String targetType) {
        UUID userId = getUserId(token);
        Bookmark result = bookmarkService.toggleBookmark(userId, targetId, targetType);
        return ResponseEntity.ok(result != null ? result : "Bookmark removed");
    }

    @GetMapping("/bookmarks/check")
    public ResponseEntity<Boolean> checkBookmark(
            @RequestHeader("Authorization") String token,
            @RequestParam UUID targetId,
            @RequestParam String targetType) {
        UUID userId = getUserId(token);
        return ResponseEntity.ok(bookmarkService.isBookmarked(userId, targetId, targetType));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(@RequestHeader("Authorization") String token) {
        UUID userId = getUserId(token);
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestHeader("Authorization") String token) {
        UUID userId = getUserId(token);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<?> markAsRead(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID id) {
        UUID userId = getUserId(token);
        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok("Marked as read");
    }

    @PostMapping("/notifications/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String token) {
        UUID userId = getUserId(token);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok("All marked as read");
    }
}
