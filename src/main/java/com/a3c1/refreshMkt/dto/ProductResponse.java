package com.a3c1.refreshMkt.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.GetMapping;

@Getter
@Setter
public class ProductResponse {
    private Integer id;
    private String title;
    private Integer price;
    private String image;

    public ProductResponse(Integer id, String title, Integer price, String imageUrl) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.image = imageUrl;
    }
}
