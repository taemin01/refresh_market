import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/NewLogin.css'
import axios from 'axios';

const NewLogin = () => {
    const [username, setUsername] = useState('');
    const [location, setLocation] = useState('');
    const [errorUsername, setErrorUsername] = useState('');
    const [errorLocation, setErrorLocation] = useState('');
    const [kakaoId, setKakaoId] = useState(null);
    const navigate = useNavigate();

    // useEffect로 로컬 스토리지에서 Kakao ID를 가져옵니다.
    useEffect(() => {
        const storedKakaoId = sessionStorage.getItem('kakaoId');
        if (storedKakaoId) {
            setKakaoId(storedKakaoId);

            // Kakao ID가 존재하는 경우 백엔드에 요청해 사용자 확인
            checkExistingUser(storedKakaoId);
        } else {
            console.error('Kakao ID가 없습니다. 다시 로그인해주세요.');
            navigate('/kakaologin');
        }
    }, [navigate]);

    // 이미 존재하는 사용자 확인 함수
    const checkExistingUser = async (kakaoId) => {
        try {
            const response = await axios.post('http://localhost:8080/users/check-kakao-id', {
                kakaoId: kakaoId,
            });

            if (response.data.exists) {
                // 이미 존재하는 사용자일 경우 홈 페이지로 리다이렉트
                navigate('/');
            }
        } catch (error) {
            console.error('Error checking Kakao ID:', error);
        }
    };

    // 회원명 유효성 검사 함수
    const validateUsername = (name) => {
        if (name.length > 10) return '회원명은 10자 이하이어야 합니다.';
        const specialCharRegex = /^[!@#$%^&*()_+={}\[\]:;"'<>,.?~-]*$/;
        if (specialCharRegex.test(name)) return '회원명은 특수문자로만 이루어질 수 없습니다.';
        return null;
    };

    // 회원명 중복 확인 함수
    const checkUsername = async () => {
        const usernameError = validateUsername(username);
        if (usernameError) {
            setErrorUsername(usernameError);
            return;
        } else {
            sessionStorage.setItem('nickname', username);
        }

        try {
            const response = await axios.post('http://localhost:8080/users/check-username', {
                username: username,
            });

            setErrorUsername(response.data.exists ? '이미 사용 중인 회원명입니다.' : '사용 가능한 회원명입니다.');
        } catch (error) {
            console.error('Error:', error);
            setErrorUsername('회원명 확인 중 오류가 발생했습니다.');
        }
    };

    // 위치 인증 처리 함수
    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currentLocation = `${position.coords.latitude}, ${position.coords.longitude}`;
                    console.log(position.coords.latitude, position.coords.longitude);
                    sessionStorage.setItem('location_x', position.coords.latitude);
                    sessionStorage.setItem('location_y', position.coords.longitude);
                    setLocation(currentLocation);
                    setErrorLocation('');
                },
                (error) => {
                    console.error('위치 오류:', error);
                    setErrorLocation('위치 정보를 가져올 수 없습니다.');
                }
            );
        } else {
            setErrorLocation('Geolocation을 지원하지 않는 브라우저입니다.');
        }
    };

    // 회원가입 처리 함수
    const handleSignUp = async () => {
        if (!username || !location) {
            setErrorUsername(username ? '' : '회원명을 입력해주세요.');
            setErrorLocation(location ? '' : '위치 인증이 필요합니다.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/users/signup', {
                kakaoId: kakaoId,
                username: username,
                location: location,
            });

            console.log('회원가입 성공:', response.data);
            navigate('/'); // 회원가입 성공 시 홈 페이지로 이동
            setTimeout(() => window.location.reload(), 0);
        } catch (error) {
            console.error('Error:', error);
            setErrorUsername('회원가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="singup-container">
            <div className="signup-page">
                <p className="title">회원명</p>
                <input
                    type="text"
                    placeholder="회원명을 입력해주세요."
                    className="insert"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button className="check" onClick={checkUsername}>
                    중복확인
                </button>
                {errorUsername && <p className="error-msg">{errorUsername}</p>}

                <p className="title">위치 인증</p>
                <button className="location-button" onClick={handleLocation}>
                    현재 위치 인증
                </button>
                {errorLocation && <p className="error-msg">{errorLocation}</p>}

                <br/>

                <button className="signup-button" onClick={handleSignUp}>
                    회원가입
                </button>
            </div>
        </div>


    );
};

export default NewLogin;