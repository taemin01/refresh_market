package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.repository.BookmarkRepository;
import com.a3c1.refreshMkt.repository.RegistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional //두 개의 작업이 이루어지므로 데이터 무결성을 위해 적용
public class RegistService {

    private final RegistRepository registRepository;
    private final BookmarkRepository bookmarkRepository;

    public RegistService(RegistRepository registRepository, BookmarkRepository bookmarkRepository) {
        this.registRepository = registRepository;
        this.bookmarkRepository = bookmarkRepository;
    }


    // 판매글 작성
    public Product save(Product product) {
        return registRepository.save(product);
    }

    public List<Product> findAll() {
        return registRepository.findAll();
    }

    public void delete(Integer id) {
        bookmarkRepository.deleteByProductId(id);
        registRepository.deleteById(id);
    }

    public Optional<Product> findById(Integer productId) {
        return registRepository.findById(productId);
    }



}
