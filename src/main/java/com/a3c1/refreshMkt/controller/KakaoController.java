package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.service.UserService;
import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth/kakao")
public class KakaoController {
    private final UserService userService;

    public KakaoController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> kakaoCallback(@RequestParam String code) {
        RestTemplate restTemplate = new RestTemplate();
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/x-www-form-urlencoded");

        String body = "grant_type=authorization_code"
                + "&client_id=07b9f4866bc45f61d932f827f82136c9"
                + "&redirect_uri=http://localhost:3000/auth/kakao/callback"
                + "&code=" + code;

        try {
            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, request, String.class);

            JSONObject jsonObj = new JSONObject(response.getBody());
            String accessToken = jsonObj.getString("access_token");
            System.out.println("jsonObj" + jsonObj);
            System.out.println("token" + accessToken);

            headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> userInfoResponse = restTemplate.exchange(
                    "https://kapi.kakao.com/v2/user/me",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            System.out.println("userInfoRes" + userInfoResponse);

            JSONObject userInfo = new JSONObject(userInfoResponse.getBody());
            System.out.println("userInfo" + userInfo);
            Long kakaoId = userInfo.getLong("id");

            // 카카오 ID가 이미 존재하는지 확인
            Optional<User> existingUser = userService.getUserByKakaoId(kakaoId);
            Map<String, Object> responseMap = new HashMap<>();
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                // 기존 사용자라면 kakaoId와 닉네임을 반환
                responseMap.put("kakaoId", kakaoId);
                responseMap.put("nickname", user.getUserName());
                responseMap.put("location_x", user.getLocation_x());
                responseMap.put("location_y", user.getLocation_y());
                responseMap.put("message", "User already exists");

                System.out.println(user.getLocation_x());
                System.out.println(user.getLocation_y());
            } else {
                // 새로운 사용자라면 kakaoId만 반환
                responseMap.put("kakaoId", kakaoId);
                responseMap.put("message", "New user");
            }
            return ResponseEntity.ok(responseMap);

        } catch (HttpClientErrorException e) { // HTTP 클라이언트 오류 발생 시 처리
            // 오류 로그 출력 및 클라이언트 오류 응답 반환
            System.err.println("HTTP Client Error: " + e.getStatusCode());
            return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                    "error", "Kakao API Error", // 오류 타입 설정
                    "message", e.getResponseBodyAsString() // 오류 메시지 설정
            ));
        } catch (Exception e) { // 기타 예외 발생 시 처리
            e.printStackTrace(); // 스택 트레이스 출력
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Internal Server Error", // 오류 타입 설정
                    "message", e.getMessage() // 오류 메시지 설정
            ));
        }
    }
}