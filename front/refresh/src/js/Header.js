import React from 'react';
import '../css/Header.css'; // 헤더 관련 스타일
import logo from '../image/logo.png'; // 이미지 import
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 사용

function Header() {
  const navigate = useNavigate(); // 페이지 이동 함수 생성

  const handleWriteClick = () => {
    navigate('/writeForm'); // '/writeForm' 경로로 이동
  };

  const handleLogoClick = () => {
    navigate('/'); // 메인으로 이동
  };

  return (
    <header className="header">
      <img
        src={logo}
        alt="logo"
        onClick={handleLogoClick} // 'onClick'을 camelCase로 수정
        style={{ cursor: 'pointer' }} // 클릭 가능하게 커서 스타일 추가
      />
      <input type="text" className="search-bar" placeholder="상품명을 입력하세요!" />
      <nav>
        <button className="nav-btn">로그인</button>
        <button className="nav-btn" onClick={handleWriteClick}>글쓰기</button> {/* 클릭 이벤트 추가 */}
      </nav>
    </header>
  );
}

export default Header;
