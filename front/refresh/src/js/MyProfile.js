import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/common.css';
import '../css/MyProfile.css'; // 내 정보 페이지용 CSS
import logo from '../image/logo.png';

const MyProfile = ({ setIsLogin }) => {  // 부모 컴포넌트에서 전달받은 setIsLogin
    const [username, setUsername] = useState(sessionStorage.getItem('nickname'));
    const [location, setLocation] = useState('기본 위치');
    const [profileImage, setProfileImage] = useState(logo); // 기본 프로필 이미지
    const navigate = useNavigate();

    const handleEditUsername = () => {
        const newUsername = prompt('새로운 회원명을 입력해주세요:', username);
        if (newUsername) setUsername(newUsername);
    };

    const handleEditLocation = () => {
        const newLocation = prompt('새로운 위치를 입력해주세요:', location);
        if (newLocation) setLocation(newLocation);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // 이미지 미리보기
            };
            reader.readAsDataURL(file); // 파일을 데이터 URL로 변환
        }
    };

    const handleLogout = () => {
        // sessionStorage에서 로그인 상태를 false로 설정
        sessionStorage.setItem('isLogin', 'false');

        // setIsLogin을 false로 업데이트
        setIsLogin(false);


        // 로그인 페이지로 이동
        navigate('/');  // 홈으로 이동하도록 변경
        window.location.reload();
    };

    return (
        <div className="App">
            <h1 className="Login-title"> 마이페이지 </h1>
            <div className="profile-container">
                <div className="profile-image-container">
                    <img src={profileImage} alt="profile" className="profile-image" />
                    {/* 이미지 변경 버튼 */}
                    <div className="image-upload-container">
                        <p>프로필 이미지 선택</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="image-upload-button"
                        />
                    </div>
                </div>

                <div className="profile-info">
                    <div className="profile-item">
                        <p>회원명 :</p>
                        <span>{username}</span>
                        <button className="edit-button" onClick={handleEditUsername}>변경</button>
                    </div>
                    <div className="profile-item">
                        <p>위치 :</p>
                        <span>{location}</span>
                        <button className="edit-button" onClick={handleEditLocation}>변경</button>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>로그아웃</button>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
