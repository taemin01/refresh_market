import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/common.css';
import '../css/MyProfile.css';
import logo from '../image/logo.png';
import axios from 'axios';
import ProductItem from "./ProductItem";
import KakaoMap from "./KakaoMap"; // HTTP 요청을 위한 라이브러리

const MyProfile = ({ setIsLogin }) => {
    const [username, setUsername] = useState(sessionStorage.getItem('nickname'));
    const [location, setLocation] = useState(sessionStorage.getItem('location'));
    // const [profileImage, setProfileImage] = useState(logo);
    const [products, setProducts] = useState([]); // 상품 목록 상태
    const navigate = useNavigate();
    const kakaoId = sessionStorage.getItem('kakaoId');
    const name = sessionStorage.getItem('nickname');
    console.log(products);

    useEffect(() => {
        const userProductList = async () => {
            try {
                const response = await axios.get("http://localhost:8080/product/post/user_list",
                    {params: {username: name}},
                    {withCredentials: true})

                setProducts(response.data);
            } catch (error) {
                console.log("error : ", error);
            }

        }
        userProductList();
        convertCoordsToAddress();
        convertCoordsToAddress();
    }, []);

    // 좌표를 주소로 변환하는 함수
    const convertCoordsToAddress = () => {
        const lng = sessionStorage.getItem('location_y');
        const lat = sessionStorage.getItem('location_x');
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const address = result[0].address.address_name;
                console.log("주소 변환 성공:", address);
                setLocation(address); // React 상태에 저장
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                console.warn("주소를 찾을 수 없는 좌표:", );

            } else {
                console.error("주소 변환 실패:", status);
            }
        });
    };


    // 회원명 변경
    const handleEditUsername = async () => {
        const newUsername = prompt('새로운 회원명을 입력해주세요:', username);
        if (newUsername) {
            try {

                // 백엔드로 중복 체크 요청
                const response = await axios.post('http://localhost:8080/users/check-username', { username: newUsername });
                if (response.data.exists) {
                    alert('이미 사용 중인 회원명입니다. 다른 이름을 입력해주세요.');
                } else {
                    // 중복되지 않으면 데이터베이스 업데이트 요청
                    await axios.put('http://localhost:8080/users/update-username', { username: newUsername, kakaoId: kakaoId });
                    setUsername(newUsername); // 상태 업데이트
                    sessionStorage.setItem('nickname', newUsername);
                    alert('회원명이 성공적으로 변경되었습니다.');
                }
            } catch (error) {
                console.error(error);
                alert('회원명 변경 중 문제가 발생했습니다.');
            }
        }
    };

    // const isValidAddress = (address) => {
    //     const regex = /^[가-힣A-Za-z\s\d\-]{5,}$/; // 한글/영문, 숫자, 공백, 하이픈을 포함한 기본 주소 형식
    //     return regex.test(address);
    // };

    // 위치 변경
    const handleEditLocation = async () => {
        const newLocation = prompt('도로명 주소를 입력해주세요 : ', location);

        if (newLocation) {
            try {
                const response = await axios.get('https://dapi.kakao.com/v2/local/search/address.json', {
                    params: { query: newLocation },
                    headers: { Authorization: `KakaoAK 07b9f4866bc45f61d932f827f82136c9` }, // REST API 키 설정
                });

                // API 응답 데이터가 있는지 확인
                if (response.data.documents.length === 0) {
                    alert('올바른 주소를 입력해주세요.');
                    return;
                }

                const roadAddress = response.data.documents[0].road_address; // 도로명 주소 객체
                const addressName = roadAddress ? roadAddress.address_name : response.data.documents[0].address.address_name; // 도로명 주소가 없으면 기본 주소 사용
                console.log("디버깅 : ", addressName)

                const y = roadAddress ? roadAddress.x : response.data.documents[0].x; // X 좌표
                const x = roadAddress ? roadAddress.y : response.data.documents[0].y; // Y 좌표

                setLocation(addressName); // React 상태 업데이트
                console.log("응답 데이터 출력:", addressName, x, y);

                // 백엔드로 좌표 및 주소 업데이트
                await axios.put('http://localhost:8080/users/update-location', {
                    location_x: x,
                    location_y: y,
                    kakaoId: kakaoId,
                });

                // 세션 스토리지 업데이트
                sessionStorage.setItem('location_x', x);
                sessionStorage.setItem('location_y', y);
                sessionStorage.setItem('location', addressName);

                alert('위치가 성공적으로 변경되었습니다.');
            } catch (error) {
                console.error("위치 변경 오류:", error);
                alert('위치 변경 중 문제가 발생했습니다.');
            }
        }
    };

    const handleLogout = () => {
        sessionStorage.setItem('isLogin', 'false');
        setIsLogin(false);
        navigate('/');
        window.location.reload();
    };

    const handleClick = () => {
        navigate(`/product/${products[0].id}`);
    };

    return (
        <div className="App">
            <h1 className="Login-title"> 마이페이지 </h1>
            <div className="profile-container">


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
            <div className="" onClick={handleClick}>
                {products.length > 0 ? (
                    products.map(product => (
                        <ProductItem
                            key={product.product_id}  // 제품 ID를 key로 사용
                            id={product.product_id}

                            image={`http://localhost:8080${encodeURI(product.image)}`} // 서버에서 받은 이미지 경로
                            name={product.title} // 서버에서 받은 제품 제목
                            // discription={product.discription}
                            price={product.price} // 서버에서 받은 가격
                        />
                    ))
                ) : (
                    <p>상품 목록을 불러오는 중입니다...</p> // 상품이 없을 경우 로딩 표시
                )}
            </div>
        </div>
    );
};

export default MyProfile;
