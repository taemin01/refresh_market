package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Integer 타입으로 productId를 받도록 수정
    public Optional<Product> getProductById(Integer productId) {
        return productRepository.findById(productId); // Integer 타입을 사용
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    // 상품 ID로 상품 정보 가져오기
    //public Product getProductById(Integer id) {
    //    return productRepository.findById(id).orElse(null); // 상품이 없으면 null 반환
    //}
}
