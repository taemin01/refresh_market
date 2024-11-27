import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Bookmark.css";

const Bookmark = () => {
    const [bookmarks, setBookmarks] = useState([]);
    const navigate = useNavigate();
    const location = useLocation(); // 상품 상세 페이지에서 전달된 상태 수신

    const fetchBookmarks = async () => {
        try {
            const kakaoId = sessionStorage.getItem("kakaoId");
            if (!kakaoId) {
                alert("로그인이 필요합니다.");
                return;
            }

            const response = await axios.get(`http://localhost:8080/bookmark/user/${kakaoId}`);
            setBookmarks(response.data);
        } catch (error) {
            console.error("데이터 가져오기 실패:", error);
        }
    };

    useEffect(() => {
        // 북마크 목록 초기 로드
        fetchBookmarks();
    }, []);

    useEffect(() => {
        // 상품 상세 페이지에서 전달된 상태를 기반으로 UI 갱신
        if (location.state?.removedProductId) {
            setBookmarks((prevBookmarks) =>
                prevBookmarks.filter(
                    (bookmark) => bookmark.productId !== location.state.removedProductId

                )
            );

        }
    }, [location.state]);

    const handleBookMarkClick = (id) => {
        navigate(`/product/${id}`);
    };

    return (
        <div>
            <h1 className="bookmark-title">북마크 페이지</h1>
            {bookmarks.length > 0 ? (
                <ul className="bookmark-list">
                    {bookmarks
                        .filter((bookmark) => bookmark.status === true) // 북마크 상태가 true인 항목만 표시
                        .map((bookmark) => (
                            <li
                                key={bookmark.bookmarkId}
                                className="bookmark-item"
                                onClick={() => handleBookMarkClick(bookmark.productId)}
                            >
                                <img
                                    src={`http://localhost:8080${bookmark.image}`}
                                    alt={bookmark.productName}
                                />
                                <h3>{bookmark.productName}</h3>
                                <p>{bookmark.price}원</p>
                            </li>
                        ))}
                </ul>
            ) : (
                <p></p>
            )}
        </div>
    );
};

export default Bookmark;
