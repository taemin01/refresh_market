package com.a3c1.refreshMkt.auth;

import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * JWT 토큰 생성 및 검증을 위한 유틸리티 클래스
 * 액세스 토큰과 리프레시 토큰의 생성 및 검증을 담당
 */
@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt_secret_key}")
    private String SECRET_KEY;

    // 토큰 유효 기간 설정
    private static final long ACCESS_TOKEN_VALIDITY = 15 * 60 * 1000; // 15분
    private static final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7일

    /**
     * 액세스 토큰 생성
     * @param kakaoId 카카오 ID
     * @return 생성된 JWT 액세스 토큰
     */
    public String generateToken(String kakaoId) {
        return Jwts.builder()
                .setSubject(String.valueOf(kakaoId))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    /**
     * 토큰 유효성 검증
     * @param token 검증할 JWT 토큰
     * @return 토큰 유효 여부
     */
    public boolean validateToken(String token) {
        try {
            Jws<Claims> claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token);

            // 토큰 만료 확인
            return !claims.getBody().getExpiration().before(new Date());
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * 토큰에서 카카오 ID 추출
     * @param token JWT 토큰
     * @return 토큰에서 추출한 카카오 ID
     */
    public String getKakaoIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            logger.error("Error getting kakaoId from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 리프레시 토큰 생성
     * @param kakaoId 카카오 ID
     * @return 생성된 JWT 리프레시 토큰
     */
    public String generateRefreshToken(String kakaoId) {
        return Jwts.builder()
                .setSubject(String.valueOf(kakaoId))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    /**
     * 리프레시 토큰 유효성 검증
     * @param token 검증할 리프레시 토큰
     * @return 리프레시 토큰 유효 여부
     */
    public boolean validateRefreshToken(String token) {
        try {
            Jws<Claims> claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token);

            // 리프레시 토큰 만료 확인
            return !claims.getBody().getExpiration().before(new Date());
        } catch (Exception e) {
            logger.error("Error validating refresh token: {}", e.getMessage());
            return false;
        }
    }
}
