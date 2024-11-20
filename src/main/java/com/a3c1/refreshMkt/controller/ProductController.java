package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/product/post")
public class ProductController {

    @Autowired
    private ProductService productService;

    // 상품 상세 정보 가져오기
    @GetMapping("/{id}")
    public ResponseEntity<Object> getProductById(@PathVariable("id") Integer id) {
        try {
            Optional<Product> product = productService.getProductById(id);
            System.out.println(product.get());
            if (product.isPresent()) {
                return ResponseEntity.ok(product.get());
            } else {
                return ResponseEntity.notFound().build(); // 상품을 찾을 수 없으면 404 반환
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null); // 서버 오류 발생 시 500 상태 반환
        }
    }

}
