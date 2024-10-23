package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.repository.RegistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistService {
    @Autowired
    private RegistRepository registRepository;

    // 판매글 작성
    public Product save(Product product) {
        return registRepository.save(product);
    }

    public List<Product> findAll() {
        return registRepository.findAll();
    }

    public void registDelete(Integer id) {
        registRepository.deleteById(id);
    }
}
