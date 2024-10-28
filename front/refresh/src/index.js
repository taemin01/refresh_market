import React from 'react';
import ReactDOM from 'react-dom/client'; // React 18의 createRoot를 사용하기 위해 수정
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import '@fontsource/noto-sans-kr';

// ReactDOM.render 대신 createRoot를 사용하여 루트 DOM 요소에 렌더링
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
