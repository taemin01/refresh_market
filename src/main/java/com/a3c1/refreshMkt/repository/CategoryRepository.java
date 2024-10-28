package com.a3c1.refreshMkt.repository;

import com.a3c1.refreshMkt.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    // JpaRepository에서 기본적으로 findById 메서드가 제공됨
}
