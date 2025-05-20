package com.a3c1.refreshMkt.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, name="user_id")
    private Integer userId;

    // @Column(unique = true)
    // private String kakaoEmail;

    @Column(nullable = false, name="user_name")  // name 속성으로 컬럼명을 명시적으로 지정
    private String userName = ""; // 기본값 설정

    @Column(nullable = false)
    private double location_x = 0.0; // 기본값 설정

    @Column(nullable = false)
    private double location_y = 0.0; // 기본값 설정

    @Column(nullable = false, name = "kakao_id", unique = true) // 고유한 카카오 아이디
    private Long kakaoId;

    @Column(nullable= false)
    private Timestamp created_at = Timestamp.valueOf(LocalDateTime.now());

    //한 유저가 여러 물건을 가질 수 있음
    //@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude // 무한 재귀 방지
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Product> products;

    // 기본 생성자
    public User() {
        this.created_at = Timestamp.valueOf(LocalDateTime.now());
        this.userName = "";
        this.location_x = 0.0;
        this.location_y = 0.0;
    }
}