package com.a3c1.refreshMkt.repository;

import com.a3c1.refreshMkt.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistRepository extends JpaRepository<Product, Integer> {

}
