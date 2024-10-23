package com.a3c1.refreshMkt.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Bookmark {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer bookmark_id;

    //여러 북마크를 한 사람이 가질 수 있음
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    //여러 북마크를 한 물건이 가질 수 있음??
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

}
