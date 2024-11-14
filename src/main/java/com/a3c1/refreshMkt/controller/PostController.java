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
public class PostController {
    @Autowired
    private final RegistService registService;

    public PostController(RegistService registService) {
        this.registService = registService;
    }

    // 게시글 작성자의 활동명을 반환하는 API
    @GetMapping("/{id}/author")
    public ResponseEntity<Map<String, String>> getPostAuthor(@PathVariable Integer id) {
        // 게시글 ID로 조회
        Optional<Product> product = registService.findById(id);
        System.out.println(product);

        if (product.isPresent() && product.get().getUser() != null) {
            // 작성자의 활동명 조회
            String activityName = product.get().getUser().getUserName();
            System.out.println(activityName);
            Map<String, String> response = new HashMap<>();
            response.put("activityName", activityName);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Post or author not found"));
        }
    }
}