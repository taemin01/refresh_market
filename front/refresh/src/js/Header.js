import React, { useState, useEffect } from 'react';
import '../css/Header.css'; // 헤더 스타일 파일 import
import logo from '../image/logo.png'; // 로고 이미지 import
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate import
import { database } from "../firebase"; // Firebase 데이터베이스 import
import { ref, onValue } from "firebase/database"; // Firebase 데이터 조회 함수 import

function Header() {
    const [isLogin, setIsLogin] = useState(false); // 로그인 상태를 관리하는 state
    const [unreadMessages, setUnreadMessages] = useState(0); // 읽지 않은 메시지 수를 저장하는 state
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate hook

    // **1. 로그인 상태 확인**
    useEffect(() => {
        const storedLoginStatus = sessionStorage.getItem('isLogin'); // 세션에서 로그인 상태 가져오기
        setIsLogin(storedLoginStatus === 'true'); // 'true'일 경우 로그인 상태로 설정

        // 스토리지 변경 감지 (다른 탭에서 로그인 상태가 변경될 경우 반영)
        const handleStorageChange = () => {
            const updatedLoginStatus = sessionStorage.getItem('isLogin'); // 업데이트된 로그인 상태 가져오기
            setIsLogin(updatedLoginStatus === 'true'); // 업데이트된 상태를 반영
        };

        window.addEventListener('storage', handleStorageChange); // 스토리지 변경 이벤트 추가

        return () => {
            window.removeEventListener('storage', handleStorageChange); // 컴포넌트 언마운트 시 이벤트 제거
        };
    }, []);

    // **2. 알림 데이터 구독**
    useEffect(() => {
        if (isLogin) { // 로그인 상태일 때만 실행
            const nickname = sessionStorage.getItem("nickname"); // 현재 사용자 닉네임 가져오기
            if (!nickname) return; // 닉네임이 없으면 함수 종료

            const chatRoomsRef = ref(database, `users/${nickname}/chatRooms`); // 사용자의 채팅방 목록 경로
            const unsubscribe = onValue(chatRoomsRef, (snapshot) => {
                const rooms = snapshot.val(); // Firebase에서 채팅방 데이터 가져오기
                const totalUnread = rooms
                    ? Object.values(rooms).reduce(
                        (sum, room) => sum + (room.unreadCount || 0), // 각 채팅방의 unreadCount를 합산
                        0
                    )
                    : 0; // 데이터가 없으면 0
                setUnreadMessages(totalUnread); // 읽지 않은 메시지 수 업데이트
            });

            return () => unsubscribe(); // Firebase 구독 해제
        }
    }, [isLogin]);

    // **3. 글쓰기 버튼 클릭 핸들러**
    const handleWriteClick = () => {
        if (isLogin) {
            navigate('/writeForm'); // 로그인 상태라면 글쓰기 페이지로 이동
        } else {
            alert('로그인이 필요합니다.'); // 로그인되지 않은 경우 알림 표시
        }
    };

    // **4. 로고 클릭 핸들러**
    const handleLogoClick = () => {
        navigate('/'); // 메인 페이지로 이동
    };

    // **5. 채팅 목록 클릭 핸들러**
    const handleChatListClick = () => {
        navigate('/chat_lists'); // 채팅 목록 페이지로 이동
    };

    // **6. 로그인/내정보 버튼 클릭 핸들러**
    const handleLoginClick = () => {
        if (isLogin) {
            navigate('/myProfile'); // 로그인 상태라면 내정보 페이지로 이동
        } else {
            navigate('/kakaologin'); // 로그인되지 않은 경우 로그인 페이지로 이동
        }
    };

    return (
        <header className="header">
            {/* 로고 */}
            <img
                src={logo}
                alt="logo"
                onClick={handleLogoClick} // 클릭 시 메인 페이지로 이동
                style={{ cursor: 'pointer' }} // 클릭 가능하게 커서 스타일 추가
            />
            {/* 네비게이션 메뉴 */}
            <nav>
                <button className="nav-btn">카테고리별</button>
                <button className="nav-btn">북마크</button>
                <button className="nav-btn" onClick={handleWriteClick}>글쓰기</button> {/* 글쓰기 버튼 */}
                <button className="nav-btn" onClick={handleLoginClick}>
                    {isLogin ? '내정보' : '로그인'} {/* 로그인 상태에 따라 텍스트 변경 */}
                </button>
                <div className="nav-btn-container">
                    <button className="nav-btn" onClick={handleChatListClick}>채팅목록</button> {/* 채팅목록 버튼 */}
                    {unreadMessages > 0 && (
                        <span className="notification-badge">{unreadMessages}</span> // 알림 뱃지
                    )}
                </div>
            </nav>
            {/* 검색 바 */}
            <input type="text" className="search-bar" placeholder="상품명을 입력하세요!" />
        </header>
    );
}

export default Header;
