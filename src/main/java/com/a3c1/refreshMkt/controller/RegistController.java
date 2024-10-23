package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.service.RegistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/product")
public class RegistController {

    @Autowired
    private RegistService registService;

    //글작성
    @PostMapping("/regist")
    public Product registerProduct(@RequestBody Product product) {
        return registService.save(product);
    }

    //글목록
    @GetMapping("/list")
    public List<Product> listProducts() {
        return registService.findAll();
    }

    @GetMapping("/delete")
    public void boardDelete(@PathVariable("id") Integer id){
        registService.registDelete(id);
    }
}
