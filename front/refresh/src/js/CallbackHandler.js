import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CallbackHandler = () => {
    const navigate = useNavigate();
    const isCodeProcessed = useRef(false);

    useEffect(() => {
        const fetchKakaoData = async (code) => {
            console.log("인가코드 : ", code);
            try {
                const response = await axios.get(`http://localhost:8080/auth/kakao/callback`, {
                    params: { code },
                    withCredentials: true // 쿠키를 포함하여 요청 전송
                });

                if (response.status !== 200) {
                    throw new Error('Failed to fetch Kakao data');
                }

                const data = response.data;
                const { nickname, location_x, location_y, isNewUser } = data;

                console.log("서버 응답 데이터:", data);

                // 새로운 사용자이거나 임시 사용자명을 사용하는 경우 NewLogin 페이지로 이동
                if (isNewUser || nickname.startsWith('임시사용자_')) {
                    console.log("시도");
                    navigate('/newlogin', {replace: true});
                    console.log("리다이렉션 시도 실패?")
                } else {
                    navigate('/', { replace: true });
                    setTimeout(() => window.location.reload(), 0);
                }

                // 세션 스토리지에 로그인 상태와 위치 정보 저장
                sessionStorage.setItem('isLogin', "true");
                
                if (location_x && location_y) {
                    sessionStorage.setItem('location_x', location_x);
                    sessionStorage.setItem('location_y', location_y);
                }

                // 닉네임을 세션 스토리지에 저장
                if (nickname) {
                    sessionStorage.setItem('nickname', nickname);
                }

                
            } catch (error) {
                console.error('Error fetching Kakao data:', error);
                navigate('/login');
            }
        };

        const code = new URL(window.location.href).searchParams.get('code');

        if (code && !isCodeProcessed.current) {
            isCodeProcessed.current = true;
            fetchKakaoData(code);
        }
    }, [navigate]);

    return <div>카카오 인증 처리 중...</div>;
};

export default CallbackHandler;