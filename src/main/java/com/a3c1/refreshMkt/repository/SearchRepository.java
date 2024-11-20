package com.a3c1.refreshMkt.repository;

import com.a3c1.refreshMkt.entity.Search;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SearchRepository extends JpaRepository<Search, Long> {
    // keyword에 해당하는 검색어를 포함한 검색
    List<Search> findByKeywordContaining(String keyword);
}