import React, { useState, useEffect } from 'react';
import '../css/Header.css'; // 헤더 관련 스타일
import logo from '../image/logo.png'; // 이미지 import
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 사용

function Header({isLogin, setIsLogin}) {
    //const [isLogin, setIsLogin] = useState(false); // 로그인 상태 관리
    const navigate = useNavigate(); // 페이지 이동 함수

    // 페이지가 처음 로드될 때 로그인 상태 확인
    useEffect(() => {
        const storedLoginStatus = sessionStorage.getItem('isLogin');
        setIsLogin(storedLoginStatus === 'true');
        console.log(storedLoginStatus);

        // storage 이벤트 리스너 추가
        const handleStorageChange = () => {
            const updatedLoginStatus = sessionStorage.getItem('isLogin');
            setIsLogin(updatedLoginStatus === 'true');
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    // 글쓰기 버튼 클릭 핸들러
    const handleWriteClick = () => {
        if (isLogin) {
            navigate('/writeForm'); // '/writeForm' 경로로 이동
        } else {
            alert('로그인이 필요합니다.');
        }
    };

    // 로고 클릭 핸들러
    const handleLogoClick = () => {
        navigate('/'); // 로고 클릭 시 메인으로 이동
    };

    const handleChatListClick = () => {
        navigate('/chat_lists');
    }

    // 로그인 버튼 클릭 핸들러
    const handleLoginClick = () => {
        if (isLogin) {
            navigate('/myProfile'); // 로그인 상태일 때 내정보 페이지로 이동
        } else {
            navigate('/kakaologin'); // 로그인 페이지로 이동
        }
    };

    return (
        <header className="header">
            <img
                src={logo}
                alt="logo"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }} // 클릭 가능하게 커서 스타일 추가
            />
            <nav>
                <button className="nav-btn">카테고리별</button>
                <button className="nav-btn">북마크</button>
                <button className="nav-btn" onClick={handleWriteClick}>글쓰기</button> {/* 클릭 이벤트 추가 */}
                <button className="nav-btn" onClick={handleLoginClick}>
                    {isLogin ? '내정보' : '로그인'} {/* 로그인 상태일 때 내정보로 변경 */}
                </button>
                <button className="nav-btn" onClick={handleChatListClick}>채팅목록</button>
            </nav>
            <input type="text" className="search-bar" placeholder="상품명을 입력하세요!" />
        </header>
    );
}

export default Header;