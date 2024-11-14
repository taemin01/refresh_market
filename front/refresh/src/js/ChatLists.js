import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../firebase";
import { ref, onValue, remove } from "firebase/database"; // remove 함수 추가
import "../css/ChatLists.css";

const ChatLists = () => {
    const navigate = useNavigate();
    const [chatRooms, setChatRooms] = useState([]); // 채팅방 목록 변수 생성
    const nickname = sessionStorage.getItem("nickname"); // 사용자 활동명 가져오기

    // Firebase에서 현재 사용자의 채팅방 목록 가져오는 useEffect
    useEffect(() => {
        if (!nickname) return; // 로그인하지 않아 활동명이 세션 스토리지에 없어 값이 없는 경우 리턴

        // Firebase에서 사용자 채팅방 목록 가져오기 위한 참조 경로 설정 부분
        const chatRoomsRef = ref(database, `users/${nickname}/chatRooms`);

        // Firebase의 onValue를 사용해 실시간 데이터 동기화 및 상태 업데이트
        const unsubscribe = onValue(chatRoomsRef, (snapshot) => {
            const rooms = snapshot.val();

            // 데이터가 있을 경우 객체의 값을 배열로 변환하여 상태에 저장. 없으면 빈 배열로 설정
            const roomList = rooms
                ? Object.entries(rooms).map(([id, room]) => ({ id, ...room }))
                : [];
            setChatRooms(roomList);
        });

        // 컴포넌트 언마운트 시 Firebase 리스너 제거
        return () => unsubscribe();
    }, [nickname]);

    // 채팅방 삭제 함수
    const handleDeleteChatRoom = (chatRoomId) => {
        const confirmation = window.confirm("정말 삭제하시겠습니까?");
        if (confirmation) {
            const chatRoomRef = ref(database, `users/${nickname}/chatRooms/${chatRoomId}`);
            // Firebase에서 해당 채팅방 삭제
            remove(chatRoomRef)
                .then(() => {
                    console.log("채팅방이 삭제되었습니다.");
                    // 삭제 후 채팅방 목록에서 제거
                    setChatRooms((prevChatRooms) =>
                        prevChatRooms.filter((room) => room.id !== chatRoomId)
                    );
                })
                .catch((error) => {
                    console.error("채팅방 삭제 중 오류 발생:", error);
                });
        }
    };

    // 채팅방 클릭 시 호출되는 함수 -> 클릭된 채팅방으로 이동
    const handleChatRoomClick = (chatRoomId, receiver, productPrice, productName, productImage) => {
        // 선택한 채팅방으로 이동
        navigate(`/chat/${chatRoomId}`, {
            state: { chatRoomId, sender: nickname, receiver, productPrice, productName, productImage }
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
                            onClick={() =>
                                handleChatRoomClick(
                                    room.id,
                                    room.receiver,
                                    room.productPrice,
                                    room.productName,
                                    room.productImage
                                )
                            }
                        >
                            {/* 프로필 이미지 (상품 이미지 대체) */}
                            <img
                                src={room.productImage}
                                alt={room.productName}
                                className="profile-image"
                            />
                            <div className="chat-info">
                                <div className="chat-header">
                                    <h3 className="chat-name">{room.productName} / {room.receiver}</h3>
                                    <small className="chat-timestamp">
                                        {new Date(room.timestamp).toLocaleTimeString()}
                                    </small>
                                </div>
                                <p className="chat-last-message">{room.lastMessage}</p>
                            </div>
                            {/* 삭제 버튼 추가 */}
                            <button
                                className="delete-button"
                                onClick={(e) => {
                                    e.stopPropagation(); // 채팅방으로 이동하는 이벤트 막기
                                    handleDeleteChatRoom(room.id); // 삭제 함수 호출
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