package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.service.RegistService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    @Autowired
    private final RegistService registService;

    public PostController(RegistService registService) {
        this.registService = registService;
    }

    // 게시글 작성자의 정보, 게시글 정보를 반환하는 API
    @GetMapping("/{id}/author")
    public ResponseEntity<Map<String, Object>> getPostAuthor(@PathVariable Integer id) {
        // 게시글 ID로 조회
        Optional<Product> product = registService.findById(id);
        System.out.println("product 출력"+product);

        if (product.isPresent() && product.get().getUser() != null) {
            // 작성자의 활동명 조회
            String activityName = product.get().getUser().getUserName();
            double location_x = product.get().getUser().getLocation_x();
            double location_y = product.get().getUser().getLocation_y();
            char status = product.get().getStatus();
            int productId = product.get().getProduct_id();
//            System.out.println("name : " + activityName);
//            System.out.println("x : " + location_x);
//            System.out.println("y : " + location_y);
//            System.out.println("status : " + status);
//            System.out.println("productId" + productId);

            Map<String, Object> response = new HashMap<>();
            response.put("activityName", activityName);
            response.put("location_x", location_x);
            response.put("location_y", location_y);
            response.put("transaction_status", status);
            response.put("productId", productId);


            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Post or author not found"));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<String> updatePostStatus(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        String newStatus = request.get("status");

        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().body("Status is required.");
        }

        Optional<Product> product = registService.findById(id);
        if (product.isPresent()) {
            Product existingProduct = product.get();
            existingProduct.setStatus(newStatus.charAt(0)); // 상태 업데이트
            registService.save(existingProduct); // 변경된 상태 저장
            return ResponseEntity.ok("Transaction status updated.");
        } else {
            return ResponseEntity.status(404).body("Product not found.");
        }
    }

}
