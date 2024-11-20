package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Category;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.service.RegistService;
import com.a3c1.refreshMkt.service.CategoryService;
import com.a3c1.refreshMkt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// RegistController 클래스에 @CrossOrigin 추가
@CrossOrigin(origins = "http://localhost:3000")  // React 서버 주소
@RestController
@RequestMapping("/product")
public class RegistController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    @Autowired
    private RegistService registService;

    @PostMapping("/regist")
    public Product registerProduct(
            @RequestParam("title") String title,
            @RequestParam("category_id") Integer categoryId,
            @RequestParam(value = "kakao_id", required = false) Long kakaoId,
            @RequestParam("price") Integer price,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image) { // 이미지 파일

        char status = 'a'; // status는 항상 a:판매중

        // kakaoId가 null인 경우에만 더미 사용자 생성
        User user;

        if (kakaoId != null) {
          user = userService.getUserByKakaoId(kakaoId).get();
        } else {
            // 더미 사용자 생성
            user = new User();
            user.setKakaoId(0L);
            user.setUserName("더미 사용자");
            user.setLocation_x(0.0f);
            user.setLocation_y(0.0f);
            user.setCreated_at(Timestamp.valueOf(LocalDateTime.now()));
            user = userService.save(user); // 사용자 저장
        }

        Category category = categoryService.findById(categoryId)
                .orElseGet(() -> categoryService.findById(1).orElse(null));

        Product product = new Product();
        product.setTitle(title);
        product.setPrice(price);
        product.setDescription(description);
        product.setStatus(status);
        product.setCategory(category);
        product.setUser(user);

        // 이미지 처리 부분
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image); // 이미지 저장 메서드 호출
            product.setImage(imagePath);
        } else {
            product.setImage("default.jpg"); // 기본 이미지 경로 설정
        }

        return registService.save(product); // 저장
    }


    @PostMapping("/delete")
    public ResponseEntity<Void> deleteProduct(@RequestParam Integer productId) {
        try {
            registService.delete(productId);
            return ResponseEntity.noContent().build(); // 성공 시 204 No Content 반환
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build(); // 에러 시 500 반환
        }
    }

    @PostMapping("/modify")
    public ResponseEntity<Product> modifyProduct(
            @RequestParam("product_id") Integer productId,
            @RequestParam("title") String title,
            @RequestParam("category_id") Integer categoryId,
            @RequestParam(value = "kakao_id", required = false) Long kakaoId,
            @RequestParam("price") Integer price,
            @RequestParam("description") String description,
            @RequestParam("status") char status,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            Product product = registService.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid product ID: " + productId));

            // 사용자 권한 확인
            //if (userId != null && !product.getUser().getUser_id().equals(userId)) {
            //    System.err.println("User ID: " + userId + ", Product Owner ID: " + product.getUser().getUser_id());
            //    throw new IllegalArgumentException("You do not have permission to modify this product.");
            //}

            // 수정할 제품 정보 설정
            product.setTitle(title);
            product.setPrice(price);
            product.setDescription(description);
            product.setStatus(status);

            // 카테고리 설정 (이 부분은 기존 로직 유지)
            Category category = categoryService.findById(categoryId)
                    .orElseGet(() -> categoryService.findById(1).orElse(null));
            product.setCategory(category);

            // 이미지 처리
            if (image != null && !image.isEmpty()) {
                String imagePath = saveImage(image); // 이미지 저장 메서드 호출
                product.setImage(imagePath);
            } else if (product.getImage() == null) {
                product.setImage("default.jpg"); // 기본 이미지 경로 설정
            }

            // 수정된 게시글 저장
            return ResponseEntity.ok(registService.save(product));
        } catch (Exception e) {
            System.err.println("Error modifying product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    private String saveImage(MultipartFile image) {
        // 실제 이미지 저장 로직을 구현
        // 임의로 경로를 설정하고, 이미지 파일을 해당 경로에 저장한다고 가정
        String imagePath = "path/to/image.jpg"; // 실제 저장 경로로 수정 필요
        try {
            image.transferTo(new java.io.File(imagePath)); // 이미지 파일을 해당 경로로 저장
        } catch (Exception e) {
            e.printStackTrace(); // 예외 처리
        }
        return imagePath; // 저장된 이미지 경로 반환
    }

    // 등록된 상품 목록 불러오기 ★(윤빈이꺼받아옴)
    @Transactional
    @GetMapping("/list")
    public List<Product> getProductList() {
        return registService.findAll(); // RegistService에서 모든 상품 목록을 가져옴
    }
}
