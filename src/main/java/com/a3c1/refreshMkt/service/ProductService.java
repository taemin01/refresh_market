package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.dto.ProductResponse;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.ProductRepository;
import com.a3c1.refreshMkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    private final UserRepository userRepository;

    public ProductService(UserRepository userRepository, ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;

    }

    // Integer 타입으로 productId를 받도록 수정
    public Optional<Product> getProductById(Integer productId) {
        return productRepository.findById(productId); // Integer 타입을 사용
    }

    public List<ProductResponse> getProductByUserNickname(String nickName) {
        User user = userRepository.findByUserName(nickName)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Product> products = productRepository.findByUser_UserId(user.getUserId());

        //반환 위해 DTO 변환
        return products.stream()
                .map(product -> new ProductResponse(
                        product.getProduct_id(),
                        product.getTitle(),
                        product.getPrice(),
                        product.getImage()
                )).collect(Collectors.toList());
    }

    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    // 상품 ID로 상품 정보 가져오기
    //public Product getProductById(Integer id) {
    //    return productRepository.findById(id).orElse(null); // 상품이 없으면 null 반환
    //}
}
