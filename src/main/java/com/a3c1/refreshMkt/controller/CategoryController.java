package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Category;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.service.CategoryService;
import com.a3c1.refreshMkt.service.RegistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private RegistService registService;

    @PostMapping("/regist")
    public Product registerProduct(
            @RequestParam("title") String title,
            @RequestParam("category_id") Integer categoryId,
            @RequestParam("price") Integer price,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        // categoryId로 Category 조회
        Category category = categoryService.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid category ID: " + categoryId));

        // Product 객체 생성 및 데이터 설정
        Product product = new Product();
        product.setTitle(title);
        product.setPrice(price);
        product.setDescription(description);
        product.setStatus(Product.ProductStatus.AVAILABLE);
        product.setCategory(category);

        // 이미지 처리 로직
        if (image != null && !image.isEmpty()) {
            String imagePath = registService.saveImage(image);
            product.setImage(imagePath);
        }

        return registService.save(product);
    }
}
