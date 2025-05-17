package com.a3c1.refreshMkt.auth;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt_secret_key}")
    private String SECRET_KEY;

    private static final long ACCESS_TOKEN_VALIDITY = 15 * 60 * 1000; // 15분
    private static final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7일

    public String generateToken(String kakaoId) { //카카오 아이디로 바꿔서 토큰화 하기 확실히 이 방식이 나은 듯
        return Jwts.builder()
                .setSubject(String.valueOf(kakaoId))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // 리프레시 토큰 생성
    public String generateRefreshToken(String kakaoId) {
        return Jwts.builder()
                .setSubject(String.valueOf(kakaoId))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }
}
