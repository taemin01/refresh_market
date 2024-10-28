package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Category;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.service.RegistService;
import com.a3c1.refreshMkt.service.CategoryService;
import com.a3c1.refreshMkt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

// RegistController 클래스에 @CrossOrigin 추가
@CrossOrigin(origins = "")  // React 서버 주소
@Controller
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
            @RequestParam(value = "user_id", required = false) Integer userId,
            @RequestParam("price") Integer price,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image) { // 이미지 파일

        char status = '1'; // status는 항상 1:판매중

        if (userId == null) {
            userId = 1; // 기본 userId 설정
        }

        Category category = categoryService.findById(categoryId)
                .orElseGet(() -> categoryService.findById(1).orElse(null));

        // 더미 사용자 생성 및 저장
        User user = new User();
        user.setUser_name("더미 사용자");
        user.setLocation_x(0.0f);
        user.setLocation_y(0.0f);
        user.setCreated_at(Timestamp.valueOf(LocalDateTime.now()));

        user = userService.save(user); // userService의 save 메서드 호출

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


}
