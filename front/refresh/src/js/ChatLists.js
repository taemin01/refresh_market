import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../firebase";
import { ref, onValue, remove, update } from "firebase/database";
import "../css/ChatLists.css";

const ChatLists = () => {
    const navigate = useNavigate();
    const [chatRooms, setChatRooms] = useState([]); // 채팅방 목록 상태
    const nickname = sessionStorage.getItem("nickname"); // 현재 사용자 닉네임

    // **1. Firebase에서 채팅방 목록 가져오기**
    useEffect(() => {
        if (!nickname) return; // 닉네임이 없으면 종료

        const chatRoomsRef = ref(database, `users/${nickname}/chatRooms`);
        const unsubscribe = onValue(chatRoomsRef, (snapshot) => {
            const rooms = snapshot.val();
            const roomList = rooms
                ? Object.entries(rooms).map(([id, room]) => ({
                    id,
                    ...room,
                }))
                : [];
            setChatRooms(roomList);
        });

        return () => unsubscribe(); // 컴포넌트 언마운트 시 Firebase 구독 해제
    }, [nickname]);

    // **2. 채팅방 삭제**
    const handleDeleteChatRoom = (chatRoomId) => {
        const confirmation = window.confirm("정말 삭제하시겠습니까?");
        if (confirmation) {
            const chatRoomRef = ref(database, `users/${nickname}/chatRooms/${chatRoomId}`);
            remove(chatRoomRef)
                .then(() => {
                    console.log("채팅방 삭제 완료");
                    setChatRooms((prev) => prev.filter((room) => room.id !== chatRoomId));
                })
                .catch((error) => console.error("채팅방 삭제 중 오류:", error));
        }
    };

    // **3. 채팅방 입장**
    const handleChatRoomClick = async (chatRoomId, room) => {
        try {
            const chatRoomRef = ref(database, `users/${nickname}/chatRooms/${chatRoomId}`);
            await update(chatRoomRef, { unreadCount: 0 }); // 알림 초기화
            console.log(room)
        } catch (error) {
            console.error("알림 초기화 실패:", error);
        }

        navigate(`/chat/${chatRoomId}`, {
            state: {
                chatRoomId,
                sender: nickname,
                receiver: room.receiver,
                productPrice: room.productPrice,
                productName: room.productName,
                productImage: room.productImage,
                receiver_location_x: room.receiver_location_x,
                receiver_location_y: room.receiver_location_y,
                productId: room.productId
            },
        });
    };

    return (
        <div className="chat-lists">
            <h2>{nickname}님의 채팅 목록</h2>
            <div className="chat-list-items">
                {chatRooms.length === 0 ? (
                    <p>진행 중인 채팅이 없습니다.</p>
                ) : (
                    chatRooms.map((room) => (
                        <div
                            key={room.id}
                            className="chat-list-item"
                            onClick={() => handleChatRoomClick(room.id, room)}
                        >
                            <img src={room.productImage} alt={room.productName} className="profile-image" />
                            <div className="chat-info">
                                <div className="chat-header">
                                    <h3 className="chat-name">{room.productName} / {room.receiver}</h3>
                                    <small className="chat-timestamp">
                                        {new Date(room.timestamp).toLocaleString()}
                                    </small>
                                </div>
                                <p className="chat-last-message">{room.lastMessage || "새 메시지가 없습니다."}</p>
                            </div>
                            {/* 읽지 않은 메시지 수 표시 */}
                            {room.unreadCount > 0 && (
                                <span className="unread-count">{room.unreadCount}</span>
                            )}
                            {/* 삭제 버튼 */}
                            <button
                                className="delete-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChatRoom(room.id);
                                }}
                            >
                                삭제
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatLists;
