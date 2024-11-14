package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.User;
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

    public UserController(UserService userService) {
        this.userService = userService;
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

    // 회원 가입 또는 정보 업데이트 처리
    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signUp(@RequestBody Map<String, String> request) {
        Long kakaoId;
        try {
            kakaoId = Long.parseLong(request.get("kakaoId"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid kakaoId"));
        }

        String userName = request.get("username");
        String locationStr = request.get("location");
        if (locationStr == null || !locationStr.contains(", ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid location format"));
        }

        String[] location = locationStr.split(", ");
        float locationX;
        float locationY;
        try {
            locationX = Float.parseFloat(location[0]);
            locationY = Float.parseFloat(location[1]);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid location coordinates"));
        }

        Optional<User> existingUser = userService.getUserByKakaoId(kakaoId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setUserName(userName);
            user.setLocation_x(locationX);
            user.setLocation_y(locationY);
            userService.updateUser(user.getUser_id(), user);
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
}
