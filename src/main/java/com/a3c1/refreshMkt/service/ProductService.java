package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.dto.ProductResponse;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.ProductRepository;
import com.a3c1.refreshMkt.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);

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
        try {
            User user = userRepository.findByUserName(nickName)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with nickname: " + nickName));

            List<Product> products = productRepository.findByUser_UserId(user.getUserId());
            logger.info("Found {} products for user {}", products.size(), nickName);

            return products.stream()
                    .map(ProductResponse::new)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error getting products for user {}: {}", nickName, e.getMessage());
            throw e;
        }
    }

    public Product addProduct(Product product) {
        try {
            logger.info("Adding new product: {}", product.getTitle());
            return productRepository.save(product);
        } catch (Exception e) {
            logger.error("Error adding product: {}", e.getMessage());
            throw e;
        }
    }

    // 상품 ID로 상품 정보 가져오기
    //public Product getProductById(Integer id) {
    //    return productRepository.findById(id).orElse(null); // 상품이 없으면 null 반환
    //}
}
