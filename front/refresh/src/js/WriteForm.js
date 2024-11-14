import React, { useState, useEffect } from 'react';
import '../css/WriteForm.css'; // 스타일을 위한 CSS 파일
import imageAdd from '../image/imageAdd.jpg'; // 기본 이미지
import { useNavigate } from 'react-router-dom'; // 11.04 수정

function WriteForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    image: null,
    status: 1,
    userName: '',
    locationX: '', // location_x
    locationY: '', // location_y
    kakaoId: '',   // kakaoId
    nickname: ''    // nickname
  });

  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(imageAdd);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // 세션 스토리지에서 데이터 가져오기
    const kakaoId = sessionStorage.getItem('kakaoId');
    const locationX = sessionStorage.getItem('location_x');
    const locationY = sessionStorage.getItem('location_y');
    const nickname = sessionStorage.getItem('nickname');

    // 세션 스토리지에서 데이터가 있다면 상태 업데이트
    if (kakaoId && locationX && locationY && nickname) {
      setFormData((prevData) => ({
        ...prevData,
        kakaoId,
        locationX,
        locationY,
        nickname
      }));
    }

    setLoading(false); // 데이터 로딩 완료

  }, []);



  // 로딩 중이라면 로딩 화면을 표시
  if (loading) {
    return <div>Loading...</div>;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'description') {
      if (value.length <= 1000) {
        setFormData({ ...formData, [name]: value });
        setDescriptionLength(value.length); // 글자 수 업데이트
      }
    } else if (name === 'image') {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, [name]: file });
        setImagePreview(URL.createObjectURL(file)); // 이미지 미리보기 설정
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = new FormData();
    postData.append('title', formData.title);
    postData.append('category_id', formData.category);
    //postData.append('user_id', userData.kakaoId); // user_id 사용
    postData.append('price', formData.price);
    postData.append('description', formData.description);
    postData.append('image', formData.image);

    try {
      const response = await fetch('http://localhost:8080/product/regist', {
        method: 'POST',
        body: postData,
      });

      console.log(`Response status: ${response.status}`);
      const resultText = await response.text();
      console.log('Response text:', resultText);

      alert('상품이 등록되었습니다');
      navigate('/');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('상품 등록에 실패했습니다.');
    }
  };

  return (
    <div className="write-form">
      <h2>
        {formData.nickname}님,<br />
        물품 정보를 등록해주세요!
      </h2>
      <hr /><br />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">상품명</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="최대 50자까지 입력 가능해요."
            required
          />
        </div>

        <div className="form-inline">
          <div className="form-group">
            <label htmlFor="category">카테고리</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">카테고리를 선택해요</option>
              <option value="1">의류</option>
              <option value="2">가구</option>
              <option value="3">도서</option>
              <option value="4">전자기기</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">가격</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="가격을 결정해요."
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">물품 설명</label>
          <div className="textarea-container">
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="최대 1000자까지 입력 가능해요.\n물품에 관한 정보를 자세히 기술해주세요!"
              required
            />
            <p className="char-count">{descriptionLength}/1000 자</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image">이미지</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="image-preview">
          <img src={imagePreview} alt="Selected Preview" />
        </div>

        <button type="submit">등록</button>
      </form>
    </div>
  );
}

export default WriteForm;
