package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Bookmark;
import com.a3c1.refreshMkt.entity.BookmarkRequest;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.BookmarkRepository;
import com.a3c1.refreshMkt.repository.ProductRepository;
import com.a3c1.refreshMkt.repository.UserRepository;
import com.a3c1.refreshMkt.service.BookmarkService;
import com.a3c1.refreshMkt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/bookmark")
public class BookmarkController {

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
    public ResponseEntity<Bookmark> toggleBookmark(@PathVariable Integer productId, @RequestBody BookmarkRequest bookmarkRequest) {
        try {
            Bookmark bookmark = bookmarkService.toggleBookmark(bookmarkRequest);
            return ResponseEntity.status(HttpStatus.OK).body(bookmark);  // 변경된 북마크 객체 반환
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 사용자별 북마크 목록 조회 API
    @GetMapping("/user/{kakaoId}")
    public ResponseEntity<List<Bookmark>> getUserBookmarks(@PathVariable Long kakaoId) {
        Optional<User> existingUser = userService.getUserByKakaoId(kakaoId);
        try {
            List<Bookmark> bookmarks = bookmarkService.findByUserId(existingUser.get().getUser_id());

            if (bookmarks.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(bookmarks);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 특정 상품의 북마크 상태 확인 API
    @GetMapping("/check/{productId}")
    public ResponseEntity<Boolean> checkBookmark(
            @PathVariable Integer productId,
            @RequestParam Long kakaoId) {
        try {
            User user = userRepository.findByKakaoId(kakaoId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // 북마크 상태 확인
            boolean isBookmarked = bookmarkRepository.findByUserAndProduct(user, product)
                    .map(Bookmark::getStatus)
                    .orElse(false);

            return ResponseEntity.ok(isBookmarked);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(false);
        }
    }
}
