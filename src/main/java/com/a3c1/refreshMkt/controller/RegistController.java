package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.dto.ProductResponse;
import com.a3c1.refreshMkt.entity.Category;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.ProductRepository;
import com.a3c1.refreshMkt.service.ProductService;
import com.a3c1.refreshMkt.service.RegistService;
import com.a3c1.refreshMkt.service.CategoryService;
import com.a3c1.refreshMkt.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

// RegistController 클래스에 @CrossOrigin 추가
@CrossOrigin(origins = "http://localhost:3000")  // React 서버 주소
@RestController
@RequestMapping("/product")
public class RegistController {
    private static final Logger logger = LoggerFactory.getLogger(RegistController.class);

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;

    @Autowired
    private RegistService registService;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ProductService productService;

    @PostMapping("/regist")
    public ResponseEntity<Product> registerProduct(
            @RequestParam("title") String title,
            @RequestParam("category_id") Integer categoryId,
            @RequestParam(value = "kakao_id", required = false) Long kakaoId,
            @RequestParam("price") Integer price,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            // status는 항상 AVAILABLE로 설정
            Product.ProductStatus status = Product.ProductStatus.AVAILABLE;

            // kakaoId가 null인 경우에만 더미 사용자 생성
            User user;
            if (kakaoId != null) {
                user = userService.getUserByKakaoId(kakaoId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found with kakaoId: " + kakaoId));
            } else {
                // 더미 사용자 생성
                user = new User();
                user.setKakaoId(0L);
                user.setUserName("더미 사용자");
                user.setLocation_x(0.0f);
                user.setLocation_y(0.0f);
                user.setCreated_at(Timestamp.valueOf(LocalDateTime.now()));
                user = userService.save(user);
            }

            Category category = categoryService.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid category ID: " + categoryId));

            Product product = new Product();
            product.setTitle(title);
            product.setPrice(price);
            product.setDescription(description);
            product.setStatus(status);
            product.setCategory(category);
            product.setUser(user);

            // 이미지 처리
            if (image != null && !image.isEmpty()) {
                String imagePath = registService.saveImage(image);
                product.setImage(imagePath);
            }

            Product savedProduct = registService.save(product);
            logger.info("Product registered successfully: {}", savedProduct.getProduct_id());
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            logger.error("Error registering product: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteProduct(@RequestParam Integer productId) {
        try {
            registService.delete(productId);
            logger.info("Product deleted successfully: {}", productId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting product {}: {}", productId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
            @RequestParam("status") String status,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            Product product = registService.findById(productId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid product ID: " + productId));

            // 수정할 제품 정보 설정
            product.setTitle(title);
            product.setPrice(price);
            product.setDescription(description);
            product.setStatus(Product.ProductStatus.valueOf(status.toUpperCase()));

            // 카테고리 설정
            Category category = categoryService.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid category ID: " + categoryId));
            product.setCategory(category);

            // 이미지 처리
            if (image != null && !image.isEmpty()) {
                String imagePath = registService.saveImage(image);
                product.setImage(imagePath);
            }

            Product updatedProduct = registService.save(product);
            logger.info("Product updated successfully: {}", updatedProduct.getProduct_id());
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            logger.error("Error modifying product {}: {}", productId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Transactional
    @GetMapping("/list")
    public ResponseEntity<List<Product>> getProductList() {
        try {
            List<Product> products = registService.findAll();
            logger.info("Retrieved {} products", products.size());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            logger.error("Error retrieving product list: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
