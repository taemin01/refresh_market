import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './js/Header';
import Banner from './js/Banner';
import ProductList from './js/ProductList';
import WriteForm from './js/WriteForm'; // 글쓰기 페이지 컴포넌트 import
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<><Banner /><ProductList /></>} /> {/* 기본 홈 경로 */}
          <Route path="/writeForm" element={<WriteForm />} /> {/* 글쓰기 페이지 경로 */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
