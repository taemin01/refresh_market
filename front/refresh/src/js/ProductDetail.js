import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../css/ProductDetail.css';
import namekoImage from '../image/nameko.jpg';
import { database } from '../firebase';  // Firebase 데이터베이스 인스턴스 가져오기
import { ref, set } from "firebase/database";  // Firebase의 ref와 set 함수 가져오기

const ProductDetail = ({ product }) => {
    const navigate = useNavigate();
    const currentUser = sessionStorage.getItem("nickname"); // 현재 사용자
    const dummyProduct = {
        id: 23,
        name: '나메코-채팅테스트',
        description: '나메코 인형 입니다.',
        price: '10,000',
        image: namekoImage,
        status: 'a',
        authorName: '홍길동' // 작성자 활동명
    };

    const { id, name, description, price, image, status: initialStatus, authorName } = product || dummyProduct;

    const [transactionStatus, setTransactionStatus] = useState(initialStatus); // 거래 상태
    const [isAuthor, setIsAuthor] = useState(false); // 작성자인지 여부

    // 작성자 여부 확인
    useEffect(() => {
        console.log("현재 사용자:", currentUser);
        console.log("게시글 작성자:", authorName);
        setIsAuthor(currentUser === authorName);
    }, [currentUser, authorName]);

    // **구매자는 상태를 서버에서 새로 fetch**
    useEffect(() => {
        const fetchTransactionStatus = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/posts/${id}/author`);
                const data = response.data;
                setTransactionStatus(data.transaction_status); // 서버에서 상태를 가져옴
            } catch (error) {
                console.error("거래 상태를 가져오는 데 실패했습니다:", error);
            }
        };

        if (!isAuthor) {
            fetchTransactionStatus();
        }
    }, [id, isAuthor]);

    // 거래 상태 변경 함수 (판매자만 사용 가능)
    const handleStatusChange = async (newStatus) => {
        if (!isAuthor) return; // 판매자가 아니면 실행하지 않음

        try {
            await axios.patch(`http://localhost:8080/posts/${id}/status`, { status: newStatus });
            setTransactionStatus(newStatus); // 거래 상태 업데이트
            alert("거래 상태가 변경되었습니다.");
        } catch (error) {
            console.error("거래 상태 변경 실패:", error);
        }
    };

    // 거래하기 버튼 클릭 (구매자 전용)
    const handleBuyClick = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/posts/${id}/author`);
            const data = response.data;
            const receiver = data.activityName; // 판매자 이름
            const receiver_location_x = data.location_x;
            const receiver_location_y = data.location_y;
            const productId = data.productId;
            const chatRoomId = currentUser < receiver ? `${currentUser}_${receiver}` : `${receiver}_${currentUser}`;
            console.log(productId)
            const senderChatRoomRef = ref(database, `users/${currentUser}/chatRooms/${chatRoomId}`);
            const receiverChatRoomRef = ref(database, `users/${receiver}/chatRooms/${chatRoomId}`);

            // 구매자용 채팅방 데이터
            const chatRoomDataForSender = {
                receiver,
                productName: name,
                productImage: image,
                productPrice: price,
                productId,
                lastMessage: "",
                receiver_location_x,
                receiver_location_y,
                timestamp: Date.now()
            };

            // 판매자용 채팅방 데이터
            const chatRoomDataForReceiver = {
                receiver: currentUser,
                productName: name,
                productImage: image,
                productPrice: price,
                productId,
                lastMessage: "",
                sender_location_x: parseFloat(sessionStorage.getItem("location_x")),
                sender_location_y: parseFloat(sessionStorage.getItem("location_y")),
                timestamp: Date.now()
            };

            await set(senderChatRoomRef, chatRoomDataForSender);
            await set(receiverChatRoomRef, chatRoomDataForReceiver);



            navigate(`/chat/${chatRoomId}`, {
                state: {
                    chatRoomId,
                    receiver,
                    sender: currentUser,
                    productPrice: price,
                    productName: name,
                    productImage: image,
                    productId
                }
            });
        } catch (error) {
            console.error("채팅방 생성 실패:", error);
        }
    };

    return (
        <div className="product-detail">
            <img src={image} alt={name} className="product-detail-image" />
            <div className="product-detail-info">
                <h2>{name}</h2>
                <p className="product-detail-price">{price}</p>
                <p className="product-detail-description">{description}</p>
                <p className="product-detail-author">작성자: {authorName}</p>

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
            </div>
        </div>
    );
};

export default ProductDetail;
