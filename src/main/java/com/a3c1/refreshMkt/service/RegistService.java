package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.Product;
import com.a3c1.refreshMkt.repository.BookmarkRepository;
import com.a3c1.refreshMkt.repository.RegistRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional //두 개의 작업이 이루어지므로 데이터 무결성을 위해 적용
public class RegistService {

    private final RegistRepository registRepository;
    private final BookmarkRepository bookmarkRepository;

    @Value("${app.upload.dir:${user.home}/uploads}")
    private String uploadDir;

    public RegistService(RegistRepository registRepository, BookmarkRepository bookmarkRepository) {
        this.registRepository = registRepository;
        this.bookmarkRepository = bookmarkRepository;
    }

    public String saveImage(MultipartFile image) {
        try {
            // 업로드 디렉토리 생성
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 파일명 생성 (UUID 사용)
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;

            // 파일 저장
            Path filePath = Paths.get(uploadDir, filename);
            Files.write(filePath, image.getBytes());

            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image: " + e.getMessage());
        }
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
