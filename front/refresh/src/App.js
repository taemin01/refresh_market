import React, { useState, useEffect } from 'react';  // React, useState, useEffect를 제대로 import
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './js/Header';
import Banner from './js/Banner';
import ProductList from './js/ProductList';
import WriteForm from './js/WriteForm'; // 글쓰기 페이지 컴포넌트 import
import Login from './js/KakaoLogin';
import NewLogin from "./js/NewLogin";
import CallbackHandler from './js/CallbackHandler';
import ProductDetail from './js/ProductDetail';
import MyProfile from './js/MyProfile';
import Chat from './js/Chat';
import ChatLists from './js/ChatLists';
import KakaoMap from "./js/KakaoMap";
import Bookmark from './js/Bookmark';
import SearchResults from './js/SearchResult';


import './App.css';


function App() {
  const [isLogin, setIsLogin] = useState(false);  // 로그인 상태 관리

  useEffect(() => {
    // 세션 스토리지에서 로그인 상태 가져오기
    const loginStatus = sessionStorage.getItem('isLogin');  // sessionStorage의 오타를 수정
    if (loginStatus === 'true') {
      setIsLogin(true);  // 로그인 상태로 설정
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Header isLogin={isLogin} setIsLogin = {setIsLogin}/>
        <Routes>
          <Route path="/" element={<><Banner /><ProductList /></>} /> {/* 기본 홈 경로 */}
          <Route path="/writeForm" element={<WriteForm />} /> {/* 글쓰기 페이지 경로 */}
          <Route path="/chat/:id" element={<Chat/>}></Route>
          <Route path={"/kakaologin"} element={<Login/>}></Route>
          <Route path="/auth/kakao/callback" element={<CallbackHandler />} />

          {/* 로그인 상태에 따라 MyProfile 페이지 접근 여부 결정 */}
          <Route
            path="/myProfile"
            element={isLogin ? <MyProfile setIsLogin={setIsLogin} /> : <div>로그인 필요합니다.</div>}
          />

          <Route
              path="/myBookmark"
              element={isLogin ? <Bookmark /> : <div>로그인이 필요합니다.</div>}
          />

          {/* 검색 결과 페이지 라우트 추가 */}
          <Route path="/search/name" element={<SearchResults />} />

          <Route path={"/newlogin"} element={<NewLogin/>}></Route>
          <Route path="/writeForm/:userId" element={<WriteForm />} /> {/* 글쓰기 폼에 아이디 */}
          <Route path="/product/:id" element={<ProductDetail />} /> {/* 개별 페이지 경로 */}
          <Route
              path="/chat_lists"
              element={isLogin ? <ChatLists setIsLogin={setIsLogin} /> : <div>로그인이 필요합니다.</div>}
          />
          <Route path="/kakaoMap" element={<KakaoMap />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
