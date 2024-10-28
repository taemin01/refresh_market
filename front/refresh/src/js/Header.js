import React,{useState} from 'react';
import '../css/Header.css'; // 헤더 관련 스타일
import logo from '../image/logo.png'; // 이미지 import
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 사용

function Header() {
  const [isLogin, setIsLogin] = useState(false); //로그인 상태 관리
  const navigate = useNavigate(); // 페이지 이동 함수
  const handleWriteClick = () => {
    if (isLogin) {
        navigate('/writeForm'); // '/writeForm' 경로로 이동
    } else {
        alert('로그인이 필요합니다.'); }
  };

  const handleLogoClick = () => {
    navigate('/'); // 로고 클릭시 메인으로 이동
  };

  const handleLoginClick = () => {
    // 로그인 버튼 누를 때 동작
    if (isLogin) {
        navigate('/myProfile');
    } else {
        setIsLogin(true);
        //alert('로그인 창으로 연결되어야 합니다!!')
    }
  }

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
        <button className="nav-btn"
          onClick={handleLoginClick}>
            {isLogin? '내정보':'로그인'} </button> {/* 로그인 상태일 때 내정보로 바뀌어야 함*/}
      </nav>
      <input type="text" className="search-bar" placeholder="상품명을 입력하세요!" />
    </header>
  );
}

export default Header;
