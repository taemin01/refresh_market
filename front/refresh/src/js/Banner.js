import React from 'react';
import '../css/Banner.css'; // 배너 관련 스타일
import banner from '../image/banner.jpg'
import { useNavigate } from 'react-router-dom';

function Banner() {

  const navigate = useNavigate(); //페이지 이동 함수 생성

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div className="banner">
      <img src={banner} alt="banner"></img>
    </div>
  );
}

export default Banner;