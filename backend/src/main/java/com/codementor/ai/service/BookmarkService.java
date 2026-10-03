package com.codementor.ai.service;

import com.codementor.ai.entity.Bookmark;
import com.codementor.ai.entity.User;
import com.codementor.ai.repository.BookmarkRepository;
import com.codementor.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;

    public List<Bookmark> getUserBookmarks(UUID userId) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Bookmark toggleBookmark(UUID userId, UUID targetId, String targetType) {
        var existing = bookmarkRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return null;
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Bookmark newBookmark = Bookmark.builder()
                    .user(user)
                    .targetId(targetId)
                    .targetType(targetType)
                    .build();
            return bookmarkRepository.save(newBookmark);
        }
    }

    public boolean isBookmarked(UUID userId, UUID targetId, String targetType) {
        return bookmarkRepository.existsByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
    }
}
