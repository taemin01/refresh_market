package com.a3c1.refreshMkt.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer category_id;

    @Column(nullable = false)
    private String category_name;

    public Integer getCategoryId() {
        return category_id;
    }
}
