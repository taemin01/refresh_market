package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.entity.Search;
import com.a3c1.refreshMkt.repository.ProductRepository;
import com.a3c1.refreshMkt.repository.SearchRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SearchService {

    private final ProductRepository productRepository; // ProductRepository 주입
    private final SearchRepository searchRepository; // SearchRepository 주입

    public SearchService(ProductRepository productRepository, SearchRepository searchRepository) {
        this.productRepository = productRepository;
        this.searchRepository = searchRepository;
    }

    // keyword로 게시글 검색
    public List<Product> searchByName(String keyword) {
        // 검색 기록 저장
        Search search = new Search();
        search.setKeyword(keyword);
        search.setTimestamp(LocalDateTime.now());
        searchRepository.save(search);

        if (keyword == null || keyword.isEmpty()) {
            return List.of();  // 키워드가 없으면 모든 제품 반환
        }

        // 제목 또는 설명에서 키워드를 포함한 제품을 검색
        return productRepository.findByTitleContainingOrDescriptionContaining(keyword, keyword);
    }
}
