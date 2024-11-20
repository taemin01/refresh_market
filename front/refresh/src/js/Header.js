import React, { useState, useEffect } from 'react';
import '../css/Header.css'; // 헤더 스타일 파일 import
import logo from '../image/logo.png'; // 로고 이미지 import
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate import
import { database } from "../firebase"; // Firebase 데이터베이스 import
import { ref, onValue } from "firebase/database"; // Firebase 데이터 조회 함수 import

function Header() {
    const [isLogin, setIsLogin] = useState(false); // 로그인 상태를 관리하는 state
    const [unreadMessages, setUnreadMessages] = useState(0); // 읽지 않은 메시지 수를 저장하는 state
    const [searchKeyword, setSearchKeyword] = useState(''); // 검색창에 입력된 키워드를 저장하는 state
    const navigate = useNavigate(); // 페이지 이동을 위한 useNavigate hook

    // **1. 로그인 상태 확인 및 세션 스토리지 변경 감지**
    useEffect(() => {
        const storedLoginStatus = sessionStorage.getItem('isLogin'); // 세션에서 로그인 상태 가져오기
        setIsLogin(storedLoginStatus === 'true'); // 'true'일 경우 로그인 상태로 설정

        // 스토리지 변경 감지 (다른 탭에서 로그인 상태가 변경될 경우 반영)
        const handleStorageChange = () => {
            const updatedLoginStatus = sessionStorage.getItem('isLogin'); // 업데이트된 로그인 상태 가져오기
            setIsLogin(updatedLoginStatus === 'true'); // 업데이트된 상태를 반영
        };

        // storage 이벤트 리스너 등록
        window.addEventListener('storage', handleStorageChange);

        return () => {
            // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // **2. 알림 데이터 구독 (Firebase 활용)**
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

    // **3. 검색어 입력값을 처리하는 함수**
    const handleSearchChange = (event) => {
        setSearchKeyword(event.target.value); // 검색창에 입력된 키워드를 상태로 저장
    };

    // **4. 검색 버튼 클릭 시 검색 실행**
    const handleSearchClick = () => {
        if (searchKeyword.trim()) {
            navigate(`/search/name?keyword=${searchKeyword}`); // 검색 결과 페이지로 이동
        } else {
            alert('검색어를 입력해주세요.'); // 빈 검색어 입력 방지
        }
    };

    // **5. 엔터키 입력 시 검색 실행**
    const handleSearchKeyPress = (event) => {
        if (event.key === 'Enter' && searchKeyword.trim()) {
            handleSearchClick(); // 검색 버튼 클릭 로직 호출
        }
    };

    // **6. 다른 네비게이션 버튼 핸들러들**
    const handleWriteClick = () => {
        if (isLogin) {
            navigate('/writeForm'); // 글쓰기 페이지로 이동
        } else {
            alert('로그인이 필요합니다.'); // 로그인되지 않은 경우 경고 표시
        }
    };

    const handleLogoClick = () => {
        navigate('/'); // 메인 페이지로 이동
    };

    const handleChatListClick = () => {
        navigate('/chat_lists'); // 채팅 목록 페이지로 이동
    };

    const handleLoginClick = () => {
        if (isLogin) {
            navigate('/myProfile'); // 로그인 상태라면 내 정보 페이지로 이동
        } else {
            navigate('/kakaologin'); // 로그인되지 않은 경우 로그인 페이지로 이동
        }
    };

    const handleBookmarkClick = () => {
        if (isLogin) {
            navigate('/myBookmark'); // 북마크 페이지로 이동
        } else {
            alert('로그인이 필요합니다.'); // 로그인되지 않은 경우 경고 표시
        }
    };

    return (
        <header className="header">
            {/* 로고 (클릭 시 메인 페이지로 이동) */}
            <img
                src={logo}
                alt="logo"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer' }}
            />
            {/* 네비게이션 메뉴 */}
            <nav>
                <button className="nav-btn" onClick={handleBookmarkClick}>북마크</button>
                <button className="nav-btn" onClick={handleWriteClick}>글쓰기</button>
                <button className="nav-btn" onClick={handleLoginClick}>
                    {isLogin ? '내정보' : '로그인'}
                </button>
                <div className="nav-btn-container">
                    <button className="nav-btn" onClick={handleChatListClick}>채팅목록</button>
                    {unreadMessages > 0 && (
                        <span className="notification-badge">{unreadMessages}</span>
                    )}
                </div>
            </nav>
            {/* 검색 바 */}
            <div className="search-container">
                <input
                    type="text"
                    className="search-bar"
                    placeholder="상품명을 입력하세요!"
                    value={searchKeyword} // 입력값 상태로 설정
                    onChange={handleSearchChange} // 입력값 변경 처리
                    onKeyDown={handleSearchKeyPress} // 엔터키 이벤트 처리
                />
                {/*<button className="search-btn" onClick={handleSearchClick}>검색</button>*/}
            </div>
        </header>
    );
}

export default Header;
