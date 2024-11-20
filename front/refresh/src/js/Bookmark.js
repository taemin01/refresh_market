import React, { useEffect, useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const Bookmark = () => {
    const [bookmarks, setBookmarks] = useState([])
    const navigate = useNavigate();
    console.log("북마크 정보 : ", bookmarks);

    const fetchBookmarks = async () => {
        try {
            const kakaoId = sessionStorage.getItem("kakaoId");
            if (!kakaoId) {
                alert("로그인이 필요합니다.");
                return;
            }

            const response = await axios.get(`http://localhost:8080/bookmark/user/${kakaoId}`);
            console.log("요청 데이터 : ", response);
            setBookmarks(response.data);
        } catch (error) {
            console.error("데이터 가져오기 실패:", error);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const handleBookMarkClick = (id) => {

        navigate(`/product/${id}`);
    }

    return (
        <div>
            <h1>북마크 페이지</h1>
            {bookmarks.length > 0 ? (
                <ul>
                    {bookmarks.map((bookmark) => (

                        <li key={bookmark.bookmark_id}
                        onClick={() => handleBookMarkClick(bookmark.product.product_id)}>
                            <h3>{bookmark.product.title}</h3>
                            <p>{bookmark.product.price}원</p>
                            <img src={bookmark.product.image} alt={bookmark.product.title} />
                            <button onClick={() => alert("찜하기 상태는 변경만 가능합니다!")}>
                                ♥
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>북마크한 상품이 없습니다.</p>
            )}
        </div>
    );
};

export default Bookmark;
