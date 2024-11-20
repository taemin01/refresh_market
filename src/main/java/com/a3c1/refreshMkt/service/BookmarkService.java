package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.Bookmark;
import com.a3c1.refreshMkt.entity.BookmarkRequest;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.BookmarkRepository;
import com.a3c1.refreshMkt.repository.ProductRepository;
import com.a3c1.refreshMkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookmarkService {

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private UserRepository userRepository;  // UserRepository 추가

    @Autowired
    private ProductRepository productRepository;  // ProductRepository 추가

    // 사용자 조회 메서드 (중복 제거)
    private User getUserByKakaoId(Long kakaoId) {
        return userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // 상품 조회 메서드 (중복 제거)
    private Product getProductById(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Bookmark toggleBookmark(BookmarkRequest bookmarkRequest) {
        Long kakaoId = bookmarkRequest.getKakaoId();
        Integer productId = bookmarkRequest.getProductId();

        // 유저 및 상품 조회
        User user = getUserByKakaoId(kakaoId);
        Product product = getProductById(productId);

        // 기존 북마크가 있는지 확인
        Optional<Bookmark> existingBookmarkOpt = bookmarkRepository.findByUserAndProduct(user, product);

        if (existingBookmarkOpt.isPresent()) {
            // 기존 북마크가 있으면 상태를 토글
            Bookmark existingBookmark = existingBookmarkOpt.get();
            boolean newStatus = !existingBookmark.getStatus(); // 상태 반전
            existingBookmark.setStatus(newStatus);
            return bookmarkRepository.save(existingBookmark);
        } else {
            // 기존 북마크가 없으면 새로 생성
            Bookmark newBookmark = new Bookmark();
            newBookmark.setUser(user);
            newBookmark.setProduct(product);
            newBookmark.setStatus(true); // 활성화 상태로 생성
            return bookmarkRepository.save(newBookmark);
        }
    }


    // userId로 북마크 목록 조회
    public List<Bookmark> findByUserId(Integer userId) {
        return bookmarkRepository.findByUserId(userId);
    }
}
