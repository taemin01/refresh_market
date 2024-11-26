package com.a3c1.refreshMkt.repository;

import com.a3c1.refreshMkt.entity.Bookmark;
import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Integer> {
    // userId로 북마크 목록 조회
    @Query("SELECT b FROM Bookmark b WHERE b.user.userId = :userId")
    List<Bookmark> findByUserId(@Param("userId") Integer userId);

//    @Query("SELECT b FROM Bookmark b WHERE b.user = :user AND b.product = :product")
    Optional<Bookmark> findByUserAndProduct(@Param("user") User user, @Param("product") Product product);

    void deleteByUserAndProduct(User user, Product product);
}
