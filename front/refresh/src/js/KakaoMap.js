import React, { useEffect, useState } from 'react';
import '../css/KakaoMap.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { ref, get } from "firebase/database";
import { database } from '../firebase';

function KakaoMap() {
    const [buyerLocation, setBuyerLocation] = useState(''); // 구매자 주소
    const [sellerLocation, setSellerLocation] = useState(''); // 판매자 주소
    const [midpointLocation, setMidpointLocation] = useState(''); // 중간 지점 주소
    const [partnerLocation, setPartnerLocation] = useState(null); // 상대방 위치 저장
    const [isBuyer, setIsBuyer] = useState(null); // 구매자인지 여부 확인
    const [recommendations, setRecommendations] = useState([]); // 추천 편의시설 저장
    console.log("디버깅 : ", isBuyer)

    const location = useLocation();
    const navigate = useNavigate();
    const { chatRoomId } = location.state || {};

    const nickname = sessionStorage.getItem("nickname");
    const sender_location_x = parseFloat(sessionStorage.getItem("location_x"));
    const sender_location_y = parseFloat(sessionStorage.getItem("location_y"));
    console.log("위치 정보 : ", sender_location_x, sender_location_y)

    // Firebase에서 상대방 위치 데이터 가져오기
    const fetchPartnerLocation = async () => {
        try {
            const chatRoomRef = ref(database, `users/${nickname}/chatRooms/${chatRoomId}`);
            const snapshot = await get(chatRoomRef);
            const data = snapshot.val();

            if (!data) {
                console.error("Firebase에서 채팅방 데이터를 불러오지 못했습니다.");
                return;
            }

            if (data.sender_location_x && data.sender_location_y) {
                setIsBuyer(false); // 현재 사용자가 판매자
                setPartnerLocation({ x: data.sender_location_x, y: data.sender_location_y });
            } else if (data.receiver_location_x && data.receiver_location_y) {
                setIsBuyer(true); // 현재 사용자가 구매자
                setPartnerLocation({ x: data.receiver_location_x, y: data.receiver_location_y });
            }
        } catch (error) {
            console.error("Firebase에서 위치 정보를 가져오는 데 실패했습니다:", error);
        }
    };

    // 좌표를 주소로 변환하는 함수
    const convertCoordsToAddress = (coords, setAddress) => {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.coord2Address(coords.lng, coords.lat, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const address = result[0].address.address_name;
                console.log("주소 변환 성공:", address);
                setAddress(address); // React 상태에 저장
            } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
                console.warn("주소를 찾을 수 없는 좌표:", coords);
                setAddress("주소를 찾을 수 없습니다.");
            } else {
                console.error("주소 변환 실패:", status);
            }
        });
    };

    // Kakao 지도 초기화 함수
    const initializeMap = () => {
        if (!partnerLocation || isNaN(sender_location_x) || isNaN(sender_location_y)) {
            console.log("지도 초기화를 위한 정보가 충분하지 않습니다.");
            return;
        }

        const mapContainer = document.getElementById('map');
        const map = new window.kakao.maps.Map(mapContainer, {
            center: new window.kakao.maps.LatLng(sender_location_x, sender_location_y),
            level: 3,
        });

        const bounds = new window.kakao.maps.LatLngBounds();
        const myCoords = { lat: sender_location_x, lng: sender_location_y };
        const partnerCoords = { lat: partnerLocation.x, lng: partnerLocation.y };

        // 구매자/판매자 위치에 따라 주소 변환 및 상태 저장
        if (isBuyer) {
            convertCoordsToAddress(myCoords, setBuyerLocation); // 내 좌표를 구매자 주소로 변환
            convertCoordsToAddress(partnerCoords, setSellerLocation); // 상대방 좌표를 판매자 주소로 변환
        } else {
            convertCoordsToAddress(myCoords, setSellerLocation); // 내 좌표를 판매자 주소로 변환
            convertCoordsToAddress(partnerCoords, setBuyerLocation); // 상대방 좌표를 구매자 주소로 변환
        }

        // 중간 지점 계산
        const midpoint = calculateMidpoint(myCoords, partnerCoords);

        // 중간 지점을 주소로 변환
        convertCoordsToAddress(midpoint, setMidpointLocation);

        // 지도에 마커 추가 함수
        const addMarker = (lat, lng, title) => {
            const marker = new window.kakao.maps.Marker({
                position: new window.kakao.maps.LatLng(lat, lng),
                map: map,
            });
            bounds.extend(marker.getPosition());
        };

        // 구매자, 판매자, 중간 지점에 마커 추가
        addMarker(myCoords.lat, myCoords.lng, isBuyer ? "구매자 위치" : "판매자 위치");
        addMarker(partnerCoords.lat, partnerCoords.lng, isBuyer ? "판매자 위치" : "구매자 위치");
        addMarker(midpoint.lat, midpoint.lng, "중간 지점");

        // 편의시설 검색
        searchNearbyFacilities(midpoint, map);

        // 지도 범위 설정
        map.setBounds(bounds);
    };

    // 중간 지점 계산 함수
    const calculateMidpoint = (coord1, coord2) => {
        const midLat = (coord1.lat + coord2.lat) / 2;
        const midLng = (coord1.lng + coord2.lng) / 2;
        return { lat: midLat, lng: midLng };
    };

    // 주변 편의시설 검색 함수
    const searchNearbyFacilities = (midCoords, map) => {
        const places = new window.kakao.maps.services.Places();
        places.categorySearch('CS2', (data, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
                setRecommendations(data.map(place => ({
                    name: place.place_name,
                    address: place.road_address_name || place.address_name,
                    lat: place.y,
                    lng: place.x,
                })));
            } else {
                console.error("주변 시설 검색 실패:", status);
            }
        }, { location: new window.kakao.maps.LatLng(midCoords.lat, midCoords.lng), radius: 1000 });
    };

    useEffect(() => {
        if (window.kakao && window.kakao.maps) {
            fetchPartnerLocation();
        } else {
            const timer = setTimeout(() => {
                if (window.kakao && window.kakao.maps) {
                    fetchPartnerLocation();
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [chatRoomId]);

    useEffect(() => {
        if (partnerLocation) {
            initializeMap();
        }
    }, [partnerLocation]);

    return (
        <div>
            <main>
                <div className="input-section">
                    <div className="input-container">
                        <label>구매자 위치:</label>
                        <input className="input-buyer" type="text" value={buyerLocation} readOnly/>
                    </div>
                    <div className="input-container">
                        <label>판매자 위치:</label>
                        <input className="input-seller" type="text" value={sellerLocation} readOnly/>
                    </div>

                </div>
                <button className="reservation-button" onClick={() => navigate(-1)}>채팅으로 돌아가기</button>

                <div className="map-container">
                    <div id="map" style={{width: '100%', height: '400px'}}></div>
                </div>

                <div className="midpoint-info">
                    <h3>중간 지점 주소</h3>
                    <p>{midpointLocation}</p>
                </div>

                <h3>추천 편의시설</h3>
                <ul>
                    {recommendations.map((place, index) => (
                        <li key={index}>
                            {place.name} ({place.address})
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}

export default KakaoMap;
