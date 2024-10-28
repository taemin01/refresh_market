package com.a3c1.refreshMkt.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.w3c.dom.Text;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer product_id;

    //여러 물건을 한 사람이 판매할 수 있음
    @ManyToOne(optional = false) // 사용자 필드는 필수
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = true) // 카테고리가 선택적임을 명시
    @JoinColumn(name = "category_id", nullable = true)
    private Category category;


    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private char status; // a: 판매중, b: 예약중, c: 판매완료

    @Column(nullable = false)
    private String image;

    @CreationTimestamp // 엔티티가 처음 생성될 때 자동으로 현재 시간 입력
    @Column(nullable = false, updatable = false)
    private Timestamp created_at;

    @UpdateTimestamp // 엔티티가 수정될 때 자동으로 시간 갱신
    @Column(nullable = false)
    private Timestamp updated_at;

    //status
    public boolean isAvailable() {
        return status == 'a'; // 판매중인 경우
    }

    public boolean isReserved() {
        return status == 'b'; // 예약중인 경우
    }

    public boolean isSold() {
        return status == 'c'; // 판매완료인 경우
    }
}