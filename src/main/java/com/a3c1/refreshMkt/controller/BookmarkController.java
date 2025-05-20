package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.dto.BookmarkResponse;
import com.a3c1.refreshMkt.entity.Bookmark;
import com.a3c1.refreshMkt.entity.BookmarkRequest;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.BookmarkRepository;
import com.a3c1.refreshMkt.repository.ProductRepository;
import com.a3c1.refreshMkt.repository.UserRepository;
import com.a3c1.refreshMkt.service.BookmarkService;
import com.a3c1.refreshMkt.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bookmark")
public class BookmarkController {
    private static final Logger logger = LoggerFactory.getLogger(BookmarkController.class);

    @Autowired
    private BookmarkService bookmarkService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserService userService;

    // 북마크 추가/취소 API
    @PostMapping("/zzim/{productId}")
    public ResponseEntity<BookmarkResponse> toggleBookmark(
            @PathVariable Integer productId,
            @RequestBody BookmarkRequest bookmarkRequest) {
        try {
            logger.info("Toggling bookmark for product {} by user {}", productId, bookmarkRequest.getKakaoId());
            Bookmark bookmark = bookmarkService.toggleBookmark(bookmarkRequest);
            BookmarkResponse response = new BookmarkResponse(bookmark);
            logger.info("Bookmark toggled successfully. New status: {}", bookmark.getStatus());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error toggling bookmark for product {}: {}", productId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 사용자별 북마크 목록 조회 API
    @GetMapping("/user/{kakaoId}")
    public ResponseEntity<List<BookmarkResponse>> getUserBookmarks(@PathVariable Long kakaoId) {
        try {
            logger.info("Fetching bookmarks for user {}", kakaoId);
            Optional<User> existingUser = userService.getUserByKakaoId(kakaoId);
            if (existingUser.isEmpty()) {
                logger.warn("User not found with kakaoId: {}", kakaoId);
                return ResponseEntity.notFound().build();
            }

            List<Bookmark> bookmarks = bookmarkService.findByUserId(existingUser.get().getUserId());
            List<BookmarkResponse> response = bookmarks.stream()
                    .map(BookmarkResponse::new)
                    .collect(Collectors.toList());

            logger.info("Found {} bookmarks for user {}", bookmarks.size(), kakaoId);

            if (response.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching bookmarks for user {}: {}", kakaoId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 특정 상품의 북마크 상태 확인 API
    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> checkBookmark(
            @PathVariable Integer productId,
            @RequestParam Long kakaoId) {
        try {
            logger.info("Checking bookmark status for product {} and user {}", productId, kakaoId);
            User user = userRepository.findByKakaoId(kakaoId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with kakaoId: " + kakaoId));

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productId));

            boolean isBookmarked = bookmarkRepository.findByUserAndProduct(user, product)
                    .map(Bookmark::getStatus)
                    .orElse(false);

            logger.info("Bookmark status for product {} and user {}: {}", productId, kakaoId, isBookmarked);
            return ResponseEntity.ok(isBookmarked);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(false);
        } catch (Exception e) {
            logger.error("Error checking bookmark status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }
}
