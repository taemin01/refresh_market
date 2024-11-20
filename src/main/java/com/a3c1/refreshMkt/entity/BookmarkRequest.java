package com.a3c1.refreshMkt.entity;

public class BookmarkRequest {
    private Long kakaoId;  // kakaoId를 사용
    private Integer productId;

    // Getter와 Setter
    public Long getKakaoId() {
        return kakaoId;
    }

    public void setKakaoId(Long kakaoId) {
        this.kakaoId = kakaoId;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }
}
