import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { database } from "../firebase";
import { ref, onValue, push, remove, update, get } from "firebase/database";
import "../css/Chat.css";
import axios from "axios";

function Chat() {
    const location = useLocation(); // 라우터로 전달된 데이터
    const navigate = useNavigate(); // 페이지 이동 함수
    //state로 넘어오는 것들은 단순히 JavaScript 객체로 처리되며 넘겨준 키 이름과 변수 이름이 동일하기만 하면 된다.
    const { chatRoomId, receiver, sender, productPrice, productName, productImage, productId } = location.state || {}; // state로 전달된 데이터 추출

    const currentUser = sessionStorage.getItem("nickname"); // 현재 로그인한 사용자 닉네임
    const [messages, setMessages] = useState([]); // 채팅 메시지 상태
    const [newMessage, setNewMessage] = useState(""); // 입력 중인 새 메시지 상태
    const [contextMenu, setContextMenu] = useState(null); // 컨텍스트 메뉴 위치 상태
    const [selectedMessage, setSelectedMessage] = useState(null); // 선택된 메시지 상태
    const messagesEndRef = useRef(null); // 스크롤 위치 참조
    const [transactionStatus, setTransactionStatus] = useState(''); // 거래 상태
    console.log(productId)


    // **1. 현재 상품의 거래 상태 가져오기**
    useEffect(() => {
        const fetchTransactionStatus = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/posts/${productId}/author`
                ); // 게시글 정보 요청
                const data = response.data;

                if (data.transaction_status) {
                    setTransactionStatus(data.transaction_status); // 상태 업데이트
                } else {
                    console.warn("거래 상태를 가져올 수 없습니다.");
                }
            } catch (error) {
                console.error("거래 상태를 가져오는 데 실패했습니다:", error);
            }
        };

        if (productId) {
            fetchTransactionStatus(); // 상품 ID가 있을 때만 상태 요청
        }
    }, [productId]);

    const otherUser = currentUser === sender ? receiver : sender; // 상대방 이름

    // **1. 현재 사용자가 채팅방에 입장 중인 상태 기록**
    useEffect(() => {
        if (!currentUser || !chatRoomId) return;

        const currentChatRef = ref(database, `users/${currentUser}/currentChatRoomId`);

        // 채팅방 입장 시 채팅방 ID 기록
        update(currentChatRef, { chatRoomId }).catch((error) => {
            console.error("현재 채팅방 상태 업데이트 실패:", error);
        });

        // 컴포넌트 언마운트 시 채팅방 기록 제거
        return () => {
            remove(currentChatRef).catch((error) => {
                console.error("채팅방 상태 제거 실패:", error);
            });
        };
    }, [currentUser, chatRoomId]);

    // **2. 메시지 실시간 구독**
    useEffect(() => {
        if (!chatRoomId) return; // chatRoomId가 없으면 실행하지 않음

        const messageRef = ref(database, `chats/${chatRoomId}`); // 해당 채팅방의 메시지 경로
        const unsubscribe = onValue(messageRef, (snapshot) => {
            const data = snapshot.val();
            const chatMessages = data
                ? Object.entries(data).map(([key, value]) => ({ pushKey: key, ...value })) // Firebase PushKey와 메시지 병합
                : [];
            setMessages(chatMessages); // 상태 업데이트
        });

        return () => unsubscribe(); // 컴포넌트 언마운트 시 구독 해제
    }, [chatRoomId]);

    // **3. 메시지 전송**
    const sendMessage = async () => {
        if (!newMessage.trim()) return; // 빈 메시지 방지

        const message = {
            content: newMessage,
            sender: currentUser,
            timestamp: Date.now(),
            read: false, // 읽지 않은 상태로 메시지 전송
        };

        try {
            // Firebase에 새 메시지 추가
            const messageRef = ref(database, `chats/${chatRoomId}`);
            await push(messageRef, message);

            // 알림 상태 업데이트
            const chatRoomRef = ref(database, `users/${receiver}/chatRooms/${chatRoomId}`);
            const notificationRef = ref(database, `users/${receiver}/chatRooms/${chatRoomId}/unreadCount`);

            // **상대방이 현재 채팅방에 있는지 확인**
            const currentChatRef = ref(database, `users/${receiver}/currentChatRoomId`);
            const currentChatSnapshot = await get(currentChatRef);

            if (!currentChatSnapshot.exists() || currentChatSnapshot.val().chatRoomId !== chatRoomId) {
                // 상대방이 채팅방에 없을 경우에만 unreadCount 증가
                const notificationSnapshot = await get(notificationRef);
                const unreadCount = notificationSnapshot.exists() ? notificationSnapshot.val() : 0;

                await update(chatRoomRef, {
                    lastMessage: newMessage, // 마지막 메시지 업데이트
                    unreadCount: unreadCount + 1, // 읽지 않은 메시지 수 증가
                });
            }
        } catch (error) {
            console.error("메시지 전송 실패:", error);
        }

        setNewMessage(""); // 메시지 입력창 초기화
    };

    // **4. 메시지 삭제**
    const handleDeleteMessage = async () => {
        if (!selectedMessage) return; // 선택된 메시지가 없으면 실행하지 않음

        try {
            const messageRef = ref(database, `chats/${chatRoomId}/${selectedMessage.pushKey}`);
            await remove(messageRef); // Firebase에서 메시지 삭제
        } catch (error) {
            console.error("메시지 삭제 실패:", error);
        }
        closeContextMenu(); // 컨텍스트 메뉴 닫기
    };

    // **5. 메시지 수정**
    const handleEditMessage = async () => {
        if (!selectedMessage) return; // 선택된 메시지가 없으면 실행하지 않음

        const newContent = prompt("수정할 메시지를 입력하세요:", selectedMessage.content); // 사용자에게 수정 내용 입력받기
        if (newContent) {
            const messageRef = ref(database, `chats/${chatRoomId}/${selectedMessage.pushKey}`);
            try {
                await update(messageRef, { content: newContent }); // Firebase에서 메시지 업데이트
            } catch (error) {
                console.error("메시지 수정 실패:", error);
            }
        }
        closeContextMenu(); // 컨텍스트 메뉴 닫기
    };

    // **6. 컨텍스트 메뉴 핸들러**
    const handleRightClick = (e, message) => {
        e.preventDefault(); // 브라우저 기본 컨텍스트 메뉴 방지
        setSelectedMessage(message); // 선택된 메시지 저장
        setContextMenu({ x: e.pageX, y: e.pageY }); // 컨텍스트 메뉴 위치 설정
    };

    const closeContextMenu = () => {
        setContextMenu(null); // 컨텍스트 메뉴 닫기
        setSelectedMessage(null); // 선택된 메시지 초기화
    };

    // **7. 자동 스크롤**
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" }); // 새 메시지 도착 시 스크롤 이동
        }
    }, [messages]);

    // **8. 중간 거리 계산 이동**
    const goToMidpointCalculator = () => {
        navigate("/kakaoMap", {
            state: { chatRoomId }, // 중간 거리 계산에 필요한 데이터 전달
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") sendMessage(); // Enter 키로 메시지 전송
    };

    return (
        <div className="chat-page" onClick={closeContextMenu}>
            <div className="chat-header">
                <img src={productImage} alt={productName} className="product-image" />
                <div className="product-info">
                    <h2 className="chat-title">{otherUser}님과 대화방</h2>
                    <h2 className="product-name">{productName}</h2>
                    <p className="product-price">{productPrice}원</p>
                </div>
                <div>
                    <button className="reservation-button" onClick={goToMidpointCalculator}>
                        중간 거리 계산
                    </button>
                    <button className="reservation-button">
                        {transactionStatus === "a" && " 판매중"}
                        {transactionStatus === "b" && " 예약중"}
                        {transactionStatus === "c" && " 판매완료"}
                    </button>
                </div>
            </div>
            <div className="chat-container">
                {messages.length === 0 ? (
                    <p>{otherUser}님과의 대화 시작되었습니다.</p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index} // 메시지 고유 키
                            onContextMenu={(e) => handleRightClick(e, msg)} // 오른쪽 클릭 이벤트
                            className={msg.sender === currentUser ? "my-message" : "their-message"}
                        >
                            <div>{msg.content}</div>
                            <small className="timestamp">
                                {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString()}
                            </small>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} /> {/* 자동 스크롤 위치 */}
            </div>
            <div className="input-area">
                <input
                    type="text"
                    placeholder="메시지 작성"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress} // Enter 키로 메시지 전송
                    className="input"
                />
                <button onClick={sendMessage} className="send-button">
                    전송
                </button>
            </div>

            {/* 컨텍스트 메뉴 */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{
                        position: "absolute",
                        top: contextMenu.y,
                        left: contextMenu.x,
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                        zIndex: 1000,
                    }}
                >
                    <button onClick={handleEditMessage}>수정</button>
                    <button onClick={handleDeleteMessage}>삭제</button>
                </div>
            )}
        </div>
    );
}

export default Chat;
