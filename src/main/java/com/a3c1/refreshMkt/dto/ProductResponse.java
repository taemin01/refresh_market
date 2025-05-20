package com.a3c1.refreshMkt.dto;

import com.a3c1.refreshMkt.entity.Product;
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
    private Product.ProductStatus status;

    public ProductResponse(Integer id, String title, Integer price, String imageUrl) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.image = imageUrl;
    }

    public ProductResponse(Product product) {
        this.id = product.getProduct_id();
        this.title = product.getTitle();
        this.price = product.getPrice();
        this.image = product.getImage();
        this.status = product.getStatus();
    }
}
