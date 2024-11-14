import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { database } from "../firebase";
import { ref, onValue, push } from "firebase/database";
import "../css/Chat.css";

function Chat() {
    // URL(라우터)에서 전달된 state를 통해 채팅방 정보 및 상대방 정보 가져오기
    //chatRoomId 채팅방 고유 ID로 firebase 데이터 경로 식별 receiver 채팅 상대방 활동명
    //productPrice, Name, Image -> 상품 정보
    const location = useLocation();
    const { chatRoomId, receiver, productPrice, productName, productImage } = location.state || {};

    // 현재 사용자의 닉네임 세션 스토리지에서 가져오기
    const sender = sessionStorage.getItem("nickname");

    // 메시지 목록 상태 관리
    //messages : 채팅 메시지 목록을 저장하는 상태 변수
    //newMessage : 입력 중인 새로운 메시지를 저장하는 상태 변수
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState(""); // 입력한 새 메시지 관리

    // 채팅창의 스크롤을 맨 아래로 자동으로 이동시키기 위한 ref
    const messagesEndRef = useRef(null);

    // Firebase에서 채팅 메시지 불러오기
    useEffect(() => {
        if (!chatRoomId) return; // chatRoomId가 없으면 데이터 로딩 중단

        // Firebase에서 채팅방의 메시지 목록을 참조하는 ref 생성
        const messageRef = ref(database, `chats/${chatRoomId}`);

        // 실시간으로 메시지 불러오기
        const unsubscribe = onValue(messageRef, (snapshot) => {
            const data = snapshot.val();
            const chatMessages = data ? Object.values(data) : []; // 데이터가 없으면 빈 배열 반환
            setMessages(chatMessages); // 상태에 메시지 저장
        }, (error) => {
            console.error("Error fetching messages:", error); // 에러 처리
        });

        // 컴포넌트 언마운트 시 리스너 해제
        return () => unsubscribe();
    }, [chatRoomId]);

    // 메시지 전송 함수
    const sendMessage = async () => {
        if (!newMessage.trim()) return; // 공백 메시지 방지

        const message = {
            content: newMessage,
            sender: sender,
            timestamp: Date.now(), // 전송 시점의 타임스탬프 기록
        };

        // Firebase에 새 메시지 추가
        try {
            const messageRef = ref(database, `chats/${chatRoomId}`);
            await push(messageRef, message); // 새 메시지를 Firebase에 푸시
            console.log("Message saved to Firebase:", message);
        } catch (error) {
            console.error("Error sending message to Firebase:", error); // 에러 처리
        }

        setNewMessage(""); // 메시지 입력 필드 초기화
    };

    // 채팅창 스크롤을 맨 아래로 이동시키는 함수
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // 엔터 키로 메시지 전송하기
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    //중간 지점 계산하기

    return (
        <div className="chat-page">
            {/* 헤더 영역: 상품 정보 */}
            <div className="chat-header">
                <img src={productImage} alt={productName} className="product-image"/>
                <div className="product-info">

                    <h2 className="chat-title">{receiver}님과 대화방</h2>
                    <h2 className="product-name">{productName}</h2>
                    <p className="product-price">{productPrice}원</p>

                </div>

                <div>
                    <button className="reservation-button">중간 거리 계산</button>
                    <button className="reservation-button">예약중</button>
                </div>
            </div>

            {/* 채팅 메시지 목록 표시 */}
            <div>

            </div>
            <div className="chat-container">
            {messages.length === 0 ? (
                    <p>{receiver}님과의 대화 시작되었습니다.</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={msg.sender === sender ? "my-message" : "their-message"}>
                            <div>{msg.content}</div>
                            <small className="timestamp">
                                {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}
                            </small>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 필드 및 전송 버튼 */}
            <div className="input-area">
                <input
                    type="text"
                    placeholder="메시지 작성"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input"
                />
                <button onClick={sendMessage} className="send-button">전송</button>
            </div>
        </div>
    );
}

export default Chat;