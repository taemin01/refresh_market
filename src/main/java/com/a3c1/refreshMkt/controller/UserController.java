package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.repository.UserRepository;
import com.a3c1.refreshMkt.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    // 로그인된 사용자의 kakaoId를 세션에서 가져와서 사용자 정보를 반환
    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getUserData(HttpSession session) {
        Long kakaoId = (Long) session.getAttribute("kakaoId"); // 세션에서 kakaoId를 가져옴

        if (kakaoId == null) {
            return ResponseEntity.status(400).body(Map.of("error", "User not logged in"));
        }

        Optional<User> user = userService.getUserByKakaoId(kakaoId); // kakaoId로 DB에서 사용자 정보 조회
        if (user.isPresent()) {
            Map<String, Object> userData = new HashMap<>();
            userData.put("userName", user.get().getUserName());
            userData.put("kakaoId", user.get().getKakaoId());
            return ResponseEntity.ok(userData);
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
    }

    // 카카오 ID를 통해 사용자 존재 여부 확인
    @PostMapping("/check-kakao-id")
    public ResponseEntity<Map<String, Boolean>> checkKakaoId(@RequestBody Map<String, Long> request) {
        Long kakaoId = request.get("kakaoId"); // JSON 요청에서 kakaoId를 추출

        // kakaoId를 통해 사용자 존재 여부 확인
        Optional<User> user = userService.getUserByKakaoId(kakaoId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", user.isPresent()); // 존재 여부를 'exists' 키로 응답에 포함

        return ResponseEntity.ok(response);
    }

    // 사용자 이름 중복 체크
    @PostMapping("/check-username")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestBody Map<String, String> request) {
        String userName = request.get("username");
        Optional<User> user = userService.getUserByName(userName);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", user.isPresent());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-username")
    public ResponseEntity<Void> updateUsername(@RequestBody Map<String, String> request) {
        System.out.println("이름 : " + request.get("username"));
        String userName = request.get("username");
        Long kakaoId = Long.parseLong(request.get("kakaoId"));

        User user = userRepository.findByKakaoId(kakaoId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setUserName(userName);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update-location")
    public ResponseEntity<Void> updateLocation(@RequestBody Map<String, String> request) {
        Long kakaoId = Long.parseLong(request.get("kakaoId"));
        double location_x = Double.parseDouble(request.get("location_x"));
        double location_y = Double.parseDouble(request.get("location_y"));
        User user = userRepository.findByKakaoId(kakaoId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setLocation_x(location_x);
        user.setLocation_y(location_y);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    // 회원 가입 또는 정보 업데이트 처리
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signUp(@RequestBody Map<String, String> request) {
        String userName = request.getOrDefault("username", "");
        String locationStr = request.getOrDefault("location", "");
        Long kakaoId = Long.parseLong(request.getOrDefault("kakaoId", "0"));

        if (locationStr == null || !locationStr.contains(", ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid location format"));
        }

        String[] location = locationStr.split(", ");
        float locationX = location.length > 0 ? Float.parseFloat(location[0]) : 0.0f;
        float locationY = location.length > 1 ? Float.parseFloat(location[1]) : 0.0f;

        Optional<User> existingUser = userService.getUserByKakaoId(kakaoId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setUserName(userName);
            user.setLocation_x(locationX);
            user.setLocation_y(locationY);
            userService.save(user);
            return ResponseEntity.ok(Map.of("message", "User information updated successfully"));
        } else {
            User newUser = new User();
            newUser.setKakaoId(kakaoId);
            newUser.setUserName(userName);
            newUser.setLocation_x(locationX);
            newUser.setLocation_y(locationY);
            userService.createUser(newUser);
            return ResponseEntity.ok(Map.of("message", "User created successfully"));
        }
    }

    /**
     * 현재 로그인한 사용자의 존재 여부를 확인하는 API
     * HttpOnly 쿠키에서 kakaoId를 읽어 처리
     */
    @GetMapping("/check-user")
    public ResponseEntity<Map<String, Boolean>> checkUser(@CookieValue(name = "kakaoId", required = false) String kakaoId) {
        if (kakaoId == null) {
            return ResponseEntity.status(401).body(Map.of("exists", false));
        }

        Optional<User> user = userService.getUserByKakaoId(Long.parseLong(kakaoId));

        return ResponseEntity.ok(Map.of("exists", user.isPresent() && user.get().getUserName().isEmpty()));
    }

    /**
     * 사용자 정보 업데이트 API
     * 카카오 로그인 후 사용자 정보(활동명, 위치)를 업데이트
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateUserInfo(@CookieValue(name = "kakaoId") String kakaoId, @RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            double locationX = Double.parseDouble(request.get("location_x").toString());
            double locationY = Double.parseDouble(request.get("location_y").toString());

            Optional<User> userOpt = userService.getUserByKakaoId(Long.parseLong(kakaoId));
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            user.setUserName(username);
            user.setLocation_x(locationX);
            user.setLocation_y(locationY);

            userService.save(user);
            return ResponseEntity.ok(Map.of("message", "User information updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update user information"));
        }
    }
}
