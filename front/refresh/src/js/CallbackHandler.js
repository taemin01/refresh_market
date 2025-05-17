import React, { useEffect, useRef } from 'react';
import {redirect, useNavigate} from 'react-router-dom';
import axios from 'axios';  // axios 라이브러리를 import하여 HTTP 요청에 사용할 준비

const CallbackHandler = () => {
    const navigate = useNavigate();  // useNavigate 훅을 사용하여 페이지 이동을 위한 navigate 함수 생성
    const isCodeProcessed = useRef(false);  // useRef로 처리 상태 변수를 선언하여, 한 번만 실행되도록 제어

    // 컴포넌트가 처음 렌더링될 때 useEffect 훅이 실행
    useEffect(() => {
        // 카카오 데이터 API 요청을 보내는 비동기 함수 정의
        const fetchKakaoData = async (code) => {
            console.log("인가코드 : ", code);
            try {
                // axios를 사용해 백엔드에 GET 요청을 보냄. 카카오 인증 코드가 URL에 포함되어 전송됨
                const response = await axios.get(`http://localhost:8080/auth/kakao/callback`, {
                    params: { code }  // 쿼리 파라미터로 code를 설정 (자동으로 ?code=값 형태로 변환)
                });

                // 서버 응답이 실패 상태일 경우 에러를 발생시켜 catch 블록으로 보냄
                if (response.status !== 200) {
                    throw new Error('Failed to fetch Kakao data');
                }

                // 응답 데이터를 JSON 형태로 파싱하여 변수에 할당
                const data = response.data;
                const { email, nickname, location_x, location_y, message } = data;

                console.log(data)

                // 필수 데이터인 email이 없을 경우 에러를 발생시켜 예외 처리를 수행
                if (!email) {
                    throw new Error('email is not received');
                    // redirect()
                }

                // 세션 스토리지에 카카오 ID와 로그인 상태 저장
                // sessionStorage.setItem('kakaoId', kakaoId);  // kakaoId 저장
                sessionStorage.setItem('isLogin', "true");  // 로그인 상태 저장
                sessionStorage.setItem('location_x', location_x);  // 사용자의 위치 정보 (x 좌표) 저장
                sessionStorage.setItem('location_y', location_y);  // 사용자의 위치 정보 (y 좌표) 저장

                // 서버에서 기존 사용자임을 알리는 메시지를 받았을 경우
                if (message === "User already exists" && nickname) {
                    // 닉네임을 세션 스토리지에 저장하고 메인 페이지로 이동
                    sessionStorage.setItem('nickname', nickname);
                    navigate('/', { replace: true });  // 메인 페이지로 이동, 히스토리 교체로 뒤로가기 막음
                    setTimeout(() => window.location.reload(), 0);  // 페이지 새로고침을 즉시 수행
                } else {
                    // 신규 사용자는 로그인 정보를 입력받기 위해 NewLogin 페이지로 이동
                    navigate('/newlogin');
                }
            } catch (error) {
                // 요청이 실패하거나 예외 발생 시 에러 메시지를 콘솔에 출력
                console.error('Error fetching Kakao data:', error);
            }
        };

        // 현재 페이지의 URL에서 카카오 인증 코드 (`code` 파라미터)를 추출
        const code = new URL(window.location.href).searchParams.get('code');

        // code가 존재하고, isCodeProcessed가 false인 경우에만 요청을 처리
        if (code && !isCodeProcessed.current) {
            isCodeProcessed.current = true;  // 코드가 한 번 처리되었음을 기록하여 중복 호출 방지
            fetchKakaoData(code);  // 카카오 데이터 요청을 보내는 함수 호출
        }
    }, [navigate]);  // navigate가 변경될 때마다 useEffect 훅이 다시 실행

    // 페이지 로딩 중 메시지 표시
    return <div>카카오 인증 처리 중...</div>;
};

export default CallbackHandler;