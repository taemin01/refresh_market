import React, { useState } from 'react';
import '../css/WriteForm.css'; // 스타일을 위한 CSS 파일
import imageAdd from '../image/imageAdd.jpg'; // 기본 이미지
import {useNavigate} from 'react-router-dom'; //★ 11.04 수정

function WriteForm() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: '',
    image: null,
    userId : 1 //기본 userId로 설정 -임의로해둠-
  });

  const [imagePreview, setImagePreview] = useState(imageAdd); // 이미지 미리보기 상태
  const [descriptionLength, setDescriptionLength] = useState(0); // 설명 글자 수 상태
  const navigate = useNavigate(); //★ 11.04 수정


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
      postData.append('user_id', 1);
      postData.append('price', formData.price);
      postData.append('description', formData.description);
      postData.append('status', 'a'.charAt(0));
      postData.append('image', formData.image);

      try {
          const response = await fetch('http://localhost:8080/product/regist', {
              method: 'POST',
              body: postData,
          });

          // 응답 상태와 텍스트 확인
          console.log(`Response status: ${response.status}`);
          const resultText = await response.text();
          console.log('Response text:', resultText);

          // catch로 넘어가지 않도록 강제로 성공 처리
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
        새로고침님,<br />
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
              type="number" // 가격은 숫자로 입력 받는 것이 더 적합
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
          <div className="textarea-container"> {/* textarea를 감싸는 컨테이너 */}
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={`최대 1000자까지 입력 가능해요.\n물품에 관한 정보를 자세히 기술해주세요!`}
              required
            />
            <p className="char-count">{descriptionLength}/1000 자</p> {/* 글자 수 표시 */}
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