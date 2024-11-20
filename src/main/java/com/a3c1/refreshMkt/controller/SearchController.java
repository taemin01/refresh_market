package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.service.SearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    // keyword로 게시글 검색
    @GetMapping("/search/name")
    public List<Product> searchByName(@RequestParam(name = "keyword", required = false, defaultValue = "") String keyword) {
        return searchService.searchByName(keyword);
    }
}
