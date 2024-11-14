package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Optional<User> findById(Integer userId) {
        System.out.println("Attempting to find user with ID: " + userId);
        return userRepository.findById(userId);
    }

    public User save(User user) {
        return userRepository.save(user); // User 객체 저장
    }

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository; //DI 기법(의존성 주입)
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ID로 사용자 조회
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    // 사용자 이름으로 조회
    public Optional<User> getUserByName(String user_name) {
        return userRepository.findByUserName(user_name); // 메서드 이름 수정
    }

    // 카카오 ID로 사용자 조회
    public Optional<User> getUserByKakaoId(Long kakao_id) {
        return userRepository.findByKakaoId(kakao_id); // 메서드 이름 수정
    }

    // 새 사용자 생성
    public User createUser(User user) {
        return userRepository.save(user);
    }

    // 사용자 정보 업데이트
    public User updateUser(Integer id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setUserName((updatedUser.getUserName()));
            user.setLocation_x(updatedUser.getLocation_x());
            user.setLocation_y(updatedUser.getLocation_y());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // 사용자 삭제
    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }
}
