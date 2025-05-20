package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.service.RegistService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private final RegistService registService;

    public PostController(RegistService registService) {
        this.registService = registService;
    }

    // 게시글 작성자의 정보, 게시글 정보를 반환하는 API
    @GetMapping("/{id}/author")
    public ResponseEntity<Map<String, Object>> getPostAuthor(@PathVariable Integer id) {
        try {
            logger.info("Fetching post author information for post ID: {}", id);
            
            // 게시글 ID로 조회
            Optional<Product> product = registService.findById(id);

            if (product.isPresent() && product.get().getUser() != null) {
                Product foundProduct = product.get();
                // 작성자의 활동명 조회
                String activityName = foundProduct.getUser().getUserName();
                double location_x = foundProduct.getUser().getLocation_x();
                double location_y = foundProduct.getUser().getLocation_y();
                Product.ProductStatus status = foundProduct.getStatus();
                int productId = foundProduct.getProduct_id();

                Map<String, Object> response = new HashMap<>();
                response.put("activityName", activityName);
                response.put("location_x", location_x);
                response.put("location_y", location_y);
                response.put("transaction_status", status.name());
                response.put("productId", productId);

                logger.info("Successfully retrieved post author information for post ID: {}", id);
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Post or author not found for post ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Post or author not found"));
            }
        } catch (Exception e) {
            logger.error("Error fetching post author information for post ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updatePostStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            logger.info("Updating status for post ID {} to: {}", id, newStatus);

            if (newStatus == null || newStatus.isEmpty()) {
                logger.warn("Status update request received with empty status for post ID: {}", id);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Status is required."));
            }

            Optional<Product> productOpt = registService.findById(id);
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                try {
                    Product.ProductStatus status = Product.ProductStatus.valueOf(newStatus.toUpperCase());
                    product.setStatus(status);
                    registService.save(product);
                    logger.info("Successfully updated status for post ID {} to: {}", id, status);
                    return ResponseEntity.ok(Map.of("message", "Transaction status updated."));
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid status value received for post ID {}: {}", id, newStatus);
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Invalid status value. Allowed values are: AVAILABLE, RESERVED, SOLD"));
                }
            } else {
                logger.warn("Product not found for post ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Product not found."));
            }
        } catch (Exception e) {
            logger.error("Error updating status for post ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }
}
