package com.a3c1.refreshMkt.service;

import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Optional<User> findById(Integer userId) {
        return userRepository.findById(userId);
    }

    public User save(User user) {
        return userRepository.save(user); // User 객체 저장
    }
}
