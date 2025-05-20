package com.a3c1.refreshMkt.entity;

import jakarta.persistence.*;
// import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer category_id;

    // @NotBlank(message = "카테고리 이름은 필수입니다")
    @Column(nullable = false)
    private String category_name;

    public Category(String category_name) {
        this.category_name = category_name;
    }

    public Integer getCategoryId() {
        return category_id;
    }
}
