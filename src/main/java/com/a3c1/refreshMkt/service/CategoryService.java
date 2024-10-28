package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.Category; // Category 임포트 추가
import com.a3c1.refreshMkt.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    // 반환 타입을 Optional<Category>로 수정
    public Optional<Category> findById(Integer categoryId) {
        return categoryRepository.findById(categoryId);
    }
}
