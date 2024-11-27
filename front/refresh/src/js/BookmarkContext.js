import React, { createContext, useContext, useState } from "react";

// 북마크 Context 생성
const BookmarkContext = createContext();

// Context 사용을 위한 Custom Hook
export const useBookmark = () => useContext(BookmarkContext);

export const BookmarkProvider = ({ children }) => {
    const [bookmarks, setBookmarks] = useState([]);

    // 북마크 추가
    const addBookmark = (bookmark) => {
        setBookmarks((prev) => [...prev, bookmark]);
    };

    // 북마크 삭제
    const removeBookmark = (productId) => {
        setBookmarks((prev) => prev.filter((bookmark) => bookmark.productId !== productId));
    };

    return (
        <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, setBookmarks }}>
            {children}
        </BookmarkContext.Provider>
    );
};
