// KakaoLogin.js
import React, { useEffect } from 'react';

const KakaoLogin = () => {
    useEffect(() => {
        const clientId = '07b9f4866bc45f61d932f827f82136c9'; // 카카오 REST API 키
        const redirectUri = 'http://localhost:3000/auth/kakao/callback'; // 프론트엔드의 리다이렉트 URL
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

        // 카카오 인증 페이지로 이동
        window.location.href = kakaoAuthUrl;
    }, []);

    return <div>카카오 로그인 중...</div>
};

export default KakaoLogin;