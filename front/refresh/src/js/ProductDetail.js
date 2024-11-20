import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom"; // useParams로 상품 ID 가져오기
import axios from 'axios';
import '../css/ProductDetail.css';
import { database } from '../firebase'; // Firebase 데이터베이스
import { ref, set } from "firebase/database"; // Firebase의 ref와 set 함수

const ProductDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // URL에서 상품 ID 가져오기
    const currentUser = sessionStorage.getItem("nickname"); // 현재 사용자 정보 가져오기
    const kakaoId = sessionStorage.getItem("kakaoId"); // 로그인한 사용자의 Kakao ID
    const [product, setProduct] = useState(null); // 상품 상세 정보 상태
    const [transactionStatus, setTransactionStatus] = useState(""); // 거래 상태
    const [isBookmarked, setIsBookmarked] = useState(false); // 북마크 상태
    const [isAuthor, setIsAuthor] = useState(); // 작성자인지 여부
    const [isLogin, setIsLogin] = useState(sessionStorage.getItem("isLogin")); // 로그인 여부 상태
    console.log(isAuthor)

    // 상품 상세 정보를 가져오는 함수
    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/product/post/${id}`); // 백엔드 API 호출
                const data = response.data;
                setProduct(data); // 상품 데이터 설정
                setTransactionStatus(data.status); // 거래 상태 설정
                setIsAuthor(currentUser === data.user.userName); // 작성자인지 확인

                // 북마크 상태 가져오기
                if (kakaoId) {
                    const bookmarkResponse = await axios.get(`http://localhost:8080/bookmark/check/${id}`, {
                        params: { kakaoId },
                    });
                    setIsBookmarked(bookmarkResponse.data); // true/false 설정
                }
            } catch (error) {
                console.error("상품 정보를 가져오는 데 실패했습니다:", error);
            }
        };

        fetchProductDetail();
    }, [id, currentUser, kakaoId]);

    // 거래 상태 변경 함수 (판매자만 사용 가능)
    const handleStatusChange = async (newStatus) => {
        if (!isAuthor) return; // 작성자가 아니면 실행 불가

        try {
            await axios.patch(`http://localhost:8080/posts/${id}/status`, { status: newStatus }); // 거래 상태 변경 API 호출
            setTransactionStatus(newStatus); // 상태 업데이트
            alert("거래 상태가 변경되었습니다.");
        } catch (error) {
            console.error("거래 상태 변경 실패:", error);
        }
    };

    // 거래하기 버튼 클릭 (구매자 전용)
    const handleBuyClick = async () => {
        if (!product) {
            alert("상품 정보가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/posts/${id}/author`);
            const data = response.data;
            console.log("productDetail data : ", data);
            const transaction_status = data.transaction_status;
            const receiver = data.activityName; // 판매자 이름
            const receiver_location_x = data.location_x;
            const receiver_location_y = data.location_y;
            const chatRoomId = currentUser < receiver ? `${currentUser}_${receiver}` : `${receiver}_${currentUser}`;

            // Firebase에 채팅방 데이터 저장
            const senderChatRoomRef = ref(database, `users/${currentUser}/chatRooms/${chatRoomId}`);
            const receiverChatRoomRef = ref(database, `users/${receiver}/chatRooms/${chatRoomId}`);

            const chatRoomData = {
                receiver,
                productName: product.title,
                productImage: product.image,
                productPrice: product.price,
                productId: product.product_id,
                lastMessage: "",
                receiver_location_x,
                receiver_location_y,
                timestamp: Date.now()
            };

            await set(senderChatRoomRef, chatRoomData);
            await set(receiverChatRoomRef, {
                ...chatRoomData,
                receiver: currentUser,
                sender_location_x: parseFloat(sessionStorage.getItem("location_x")),
                sender_location_y: parseFloat(sessionStorage.getItem("location_y")),
            });

            navigate(`/chat/${chatRoomId}`, {
                state: {
                    chatRoomId,
                    receiver,
                    sender: currentUser,
                    productPrice: product.price,
                    productName: product.title,
                    productImage: product.image,
                    productId: product.id,
                    transaction_status
                }
            });
        } catch (error) {
            console.error("채팅방 생성 실패:", error);
        }
    };

    // 북마크 버튼 클릭 이벤트 처리
    const handleBookmarkButton = async () => {
        if (!isLogin) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const bookmarkRequest = {
                kakaoId,
                productId: parseInt(id, 10),
            };

            const response = await axios.post(`http://localhost:8080/bookmark/zzim/${id}`, bookmarkRequest, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200) {
                const updatedBookmark = response.data;
                if (updatedBookmark.status) {
                    alert("찜하기가 완료되었습니다.");
                } else {
                    alert("찜하기가 취소되었습니다.");
                }

                setIsBookmarked(updatedBookmark.status); // 북마크 상태 업데이트
            }
        } catch (error) {
            console.error("Bookmark request failed:", error);
            alert("찜하기 요청 중 오류가 발생했습니다.");
        }
    };

    if (!product) {
        return <p>상품 정보를 불러오는 중입니다...</p>; // 로딩 상태 표시
    }

    return (
        <div className="product-detail">
            <img src={product.image} alt={product.name} className="product-detail-image" />
            <div className="product-detail-info">
                <h2>{product.title}</h2>
                <p className="product-detail-price">{product.price}</p>
                <p className="product-detail-description">{product.description}</p>
                <p className="product-detail-author">작성자: {product.user.userName}</p>

                <div className="transaction-status">
                    <p>거래 상태: {transactionStatus === 'a' ? '판매중' : transactionStatus === 'b' ? '예약중' : '판매완료'}</p>
                    {isAuthor && (
                        <select value={transactionStatus} onChange={(e) => handleStatusChange(e.target.value)}>
                            <option value="a">판매중</option>
                            <option value="b">예약중</option>
                            <option value="c">판매완료</option>
                        </select>
                    )}
                </div>
                {!isAuthor && transactionStatus !== 'c' && (
                    <button className="buy-button" onClick={handleBuyClick}>거래하기</button>
                )}
                <button className={`heart-button ${isBookmarked ? "active" : ""}`} onClick={handleBookmarkButton}>
                    {isBookmarked ? "♥" : "♡"}
                </button>
            </div>
        </div>
    );
};

export default ProductDetail;
