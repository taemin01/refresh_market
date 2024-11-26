package com.a3c1.refreshMkt.repository;

import com.a3c1.refreshMkt.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    Optional<Product> findById(Integer productId);

    List<Product> findByUser_UserId(Integer userId);

    // 제목(title)이나 내용(description)에서 키워드를 포함하는 제품 찾기
    List<Product> findByTitleContainingOrDescriptionContaining(String titleKeyword, String descriptionKeyword);
}
