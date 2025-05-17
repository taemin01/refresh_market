package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.auth.JwtUtil;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.service.UserService;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth/kakao")
public class KakaoController {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public KakaoController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> kakaoCallback(@RequestParam String code) {
        Map<String, Object> responseMap = new HashMap<>();
        RestTemplate restTemplate = new RestTemplate();
        String tokenUrl = "https://kauth.kakao.com/oauth/token";
        System.out.println("code : " + code);

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
            String kakaoAccessToken = jsonObj.getString("access_token");
            System.out.println("jsonObj" + jsonObj);
            System.out.println("token" + kakaoAccessToken);

            headers = new HttpHeaders();
            headers.setBearerAuth(kakaoAccessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> userInfoResponse = restTemplate.exchange(
                    "https://kapi.kakao.com/v2/user/me",
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            System.out.println("userInfoRes" + userInfoResponse);

            JSONObject userInfo = new JSONObject(userInfoResponse.getBody());
            System.out.println("userInfo : " + userInfo);
            Long kakaoId = userInfo.getLong("id");
            String email = userInfo.getJSONObject("kakao_account").getBoolean("is_email_valid") ?
                   userInfo.getJSONObject("kakao_account").getString("email") : " ";
            responseMap.put("email", email);
//            String email = userInfo.getJSONObject("kakao_account").optString("email", "");

            // 카카오 ID가 이미 존재하는지 확인
            Optional<User> existingUser = userService.getUserByKakaoId(kakaoId);

            if (existingUser.isPresent()) {
                User user = existingUser.get();
                responseMap.put("nickname", user.getUserName());
                responseMap.put("location_x", user.getLocation_x());
                responseMap.put("location_y", user.getLocation_y());
                responseMap.put("message", "User already exists");

                System.out.println(user.getLocation_x());
                System.out.println(user.getLocation_y());
            } else {
                User user = new User();
                user.setKakaoId(kakaoId);
                user.setKakaoEmail(email);
                userService.createUser(user);
                responseMap.put("message", "New user");
            }

            String jwtKakaoId = String.valueOf(kakaoId) + LocalDateTime.now();

            String accessToken = jwtUtil.generateToken(jwtKakaoId);
            String refreshToken = jwtUtil.generateRefreshToken(jwtKakaoId);
            responseMap.put("accessToken", accessToken);

            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();

            //기존 브라우저 세션 스토리지에 저장한 것을 보안을 위해 쿠키에 리프레쉬 토큰과 함께 보낸다.
//            responseMap.put("kakaoId", kakaoId);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(responseMap);

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