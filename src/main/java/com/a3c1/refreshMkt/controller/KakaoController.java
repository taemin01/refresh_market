package com.a3c1.refreshMkt.controller;

import com.a3c1.refreshMkt.auth.JwtUtil;
import com.a3c1.refreshMkt.entity.User;
import com.a3c1.refreshMkt.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 카카오 로그인 관련 컨트롤러
 * 카카오 OAuth 인증 및 사용자 정보 처리를 담당
 */
@RestController
@RequestMapping("/auth/kakao")
public class KakaoController {
    private static final Logger logger = LoggerFactory.getLogger(KakaoController.class);
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    // 카카오 API 관련 상수
    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";
    private static final String CLIENT_ID = "07b9f4866bc45f61d932f827f82136c9";
    private static final String REDIRECT_URI = "http://localhost:3000/auth/kakao/callback";

    public KakaoController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * 카카오 로그인 콜백 처리
     * @param code 카카오 인증 코드
     * @return 사용자 정보와 토큰이 포함된 응답
     */
    @GetMapping("/callback")
    public ResponseEntity<Map<String, Object>> kakaoCallback(@RequestParam String code) {
        Map<String, Object> responseMap = new HashMap<>();
        RestTemplate restTemplate = new RestTemplate();
        
        try {
            logger.debug("Processing Kakao callback with code: {}", code);
            
            // 카카오 액세스 토큰 요청
            String kakaoAccessToken = getKakaoAccessToken(restTemplate, code);
            if (kakaoAccessToken == null) {
                logger.error("Failed to get Kakao access token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Failed to get Kakao access token"));
            }

            // 카카오 사용자 정보 요청
            JSONObject userInfo = getKakaoUserInfo(restTemplate, kakaoAccessToken);
            if (userInfo == null) {
                logger.error("Failed to get Kakao user info");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Failed to get Kakao user info"));
            }

            // 사용자 정보 처리
            Long kakaoId = userInfo.getLong("id");
            logger.debug("Retrieved Kakao ID: {}", kakaoId);
            
            User user = processUser(kakaoId);
            logger.debug("Processed user: {}", user);
            
            // 사용자 정보 응답에 추가
            boolean isNewUser = user.getUserName().startsWith("임시사용자_");
            responseMap.put("isNewUser", isNewUser);
            responseMap.put("nickname", user.getUserName());
            responseMap.put("location_x", user.getLocation_x());
            responseMap.put("location_y", user.getLocation_y());

            // 토큰 생성
            String jwtKakaoId = String.valueOf(kakaoId) + LocalDateTime.now();
            String accessToken = jwtUtil.generateToken(jwtKakaoId);
            String refreshToken = jwtUtil.generateRefreshToken(jwtKakaoId);
            responseMap.put("accessToken", accessToken);

            // 쿠키 설정
            ResponseCookie kakaoIdCookie = ResponseCookie.from("kakaoId", String.valueOf(kakaoId))
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();

            ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(true)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();

            logger.debug("Sending response with cookies and data: {}", responseMap);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString(), kakaoIdCookie.toString())
                    .header("Content-Security-Policy", 
                        "default-src 'self'; " +
                        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://kauth.kakao.com https://developers.kakao.com; " +
                        "style-src 'self' 'unsafe-inline'; " +
                        "img-src 'self' data: https:; " +
                        "connect-src 'self' https://kauth.kakao.com https://kapi.kakao.com;")
                    .header("X-Content-Type-Options", "nosniff")
                    .header("X-Frame-Options", "DENY")
                    .header("X-XSS-Protection", "1; mode=block")
                    .body(responseMap);

        } catch (HttpClientErrorException e) {
            logger.error("HTTP Client Error: {}", e.getMessage());
            return ResponseEntity.status(e.getStatusCode())
                    .body(Map.of(
                            "error", "Kakao API Error",
                            "message", e.getResponseBodyAsString()
                    ));
        } catch (Exception e) {
            logger.error("Internal Server Error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Internal Server Error",
                            "message", e.getMessage()
                    ));
        }
    }

    /**
     * 카카오 액세스 토큰 요청
     * @param restTemplate REST 요청을 위한 템플릿
     * @param code 카카오 인증 코드
     * @return 카카오 액세스 토큰
     */
    private String getKakaoAccessToken(RestTemplate restTemplate, String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/x-www-form-urlencoded");

        String body = String.format("grant_type=authorization_code&client_id=%s&redirect_uri=%s&code=%s",
                CLIENT_ID, REDIRECT_URI, code);

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(KAKAO_TOKEN_URL, request, String.class);
        
        JSONObject jsonObj = new JSONObject(response.getBody());
        return jsonObj.getString("access_token");
    }

    /**
     * 카카오 사용자 정보 요청
     * @param restTemplate REST 요청을 위한 템플릿
     * @param kakaoAccessToken 카카오 액세스 토큰
     * @return 카카오 사용자 정보
     */
    private JSONObject getKakaoUserInfo(RestTemplate restTemplate, String kakaoAccessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(kakaoAccessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                KAKAO_USER_INFO_URL,
                HttpMethod.GET,
                entity,
                String.class
        );

        return new JSONObject(response.getBody());
    }

    /**
     * 사용자 정보 처리
     * @param kakaoId 카카오 ID
     * @return 생성되거나 조회된 사용자 정보
     */
    private User processUser(Long kakaoId) {
        logger.debug("Processing user with Kakao ID: {}", kakaoId);
        
        Optional<User> existingUser = userService.getUserByKakaoId(kakaoId);
        
        if (existingUser.isPresent()) {
            logger.debug("Found existing user: {}", existingUser.get());
            return existingUser.get();
        } else {
            logger.debug("Creating new user with Kakao ID: {}", kakaoId);
            User newUser = new User();
            newUser.setKakaoId(kakaoId);
            newUser.setUserName("임시사용자_" + kakaoId);
            newUser.setLocation_x(0.0);
            newUser.setLocation_y(0.0);
            
            try {
                User savedUser = userService.createUser(newUser);
                logger.debug("Successfully created new user: {}", savedUser);
                return savedUser;
            } catch (Exception e) {
                logger.error("Failed to create new user: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to create new user", e);
            }
        }
    }

    /**
     * 로그아웃 처리
     * HttpOnly 쿠키를 삭제하여 로그아웃 처리
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        // 카카오 ID 쿠키 삭제
        ResponseCookie kakaoIdCookie = ResponseCookie.from("kakaoId", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();

        // 리프레시 토큰 쿠키 삭제
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, kakaoIdCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
    }
}