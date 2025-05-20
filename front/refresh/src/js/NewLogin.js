import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/NewLogin.css'
import axios from 'axios';

/**
 * 신규 사용자 정보 입력 컴포넌트
 * 카카오 로그인 후 추가 정보(활동명, 위치) 입력을 처리
 */
const NewLogin = () => {
    const [username, setUsername] = useState('');
    const [location, setLocation] = useState('');
    const [errorUsername, setErrorUsername] = useState('');
    const [errorLocation, setErrorLocation] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        checkExistingUser();
    }, [navigate]);

    // 이미 존재하는 사용자 확인 함수
    const checkExistingUser = async () => {
        try {
            const response = await axios.get('http://localhost:8080/users/check-user', {
                withCredentials: true // 쿠키를 포함하여 요청 전송
            });

            console.log(response);

            if (response.data.exists) {
                // 이미 존재하는 사용자일 경우 홈 페이지로 리다이렉트
                navigate('/');
            }
        } catch (error) {
            console.error('Error checking user:', error);
            navigate('/login'); // 오류 발생시 로그인 페이지로 리다이렉트
        }
    };

    // 회원명 유효성 검사 함수
    const validateUsername = (name) => {
        if (!name) return '회원명을 입력해주세요.';
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
        }

        try {
            const response = await axios.post('http://localhost:8080/users/check-username', {
                username: username
            }, {
                withCredentials: true // 쿠키를 포함하여 요청 전송
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
        const usernameError = validateUsername(username);
        if (usernameError || !location) {
            setErrorUsername(usernameError);
            setErrorLocation(!location ? '위치 인증이 필요합니다.' : '');
            return;
        }

        try {
            const [lat, lng] = location.split(', ');
            await axios.put('http://localhost:8080/users/update', {
                username: username,
                location_x: parseFloat(lat),
                location_y: parseFloat(lng)
            }, {
                withCredentials: true // 쿠키를 포함하여 요청 전송
            });

            navigate('/');
        } catch (error) {
            console.error('Error:', error);
            setErrorUsername('회원정보 업데이트 중 오류가 발생했습니다.');
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