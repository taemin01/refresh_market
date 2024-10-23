import React, { useState } from 'react';
import '../css/WriteForm.css'; // 스타일을 위한 CSS 파일
import imageAdd from '../image/imageAdd.jpg'; // 기본 이미지

function WriteForm() {
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    price: '',
    description: '',
    condition: 'new', // 초기값 'new'
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(imageAdd); // 이미지 미리보기 상태

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, [name]: file });
        // 선택한 이미지 파일의 URL을 생성하여 미리보기 설정
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 여기서 서버에 폼 데이터를 전송하거나 다른 작업 수행
    console.log('Form submitted:', formData);
  };

  return (
    <div className="write-form">
      <h2>상품 정보를 등록해요</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="itemName">상품명:</label>
          <input
            type="text"
            id="itemName"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            placeholder="상품명을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">카테고리:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">카테고리를 선택하세요</option>
            <option value="electronics">의류</option>
            <option value="furniture">가구</option>
            <option value="books">도서</option>
            <option value="clothes">전자기기</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">가격:</label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="가격을 입력하세요"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="explain">물품 설명:</label>
          <textarea
            id="explain"
            name="explain"
            value={formData.explain} // price -> explain 수정
            onChange={handleChange}
            placeholder="상품에 대한 정보를 알려주세요"
            required
          />
        </div>


        <div className="form-group">
          <label htmlFor="image">이미지 업로드:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        {/* 선택한 이미지 미리보기 */}
        <div className="image-preview">
          <img src={imagePreview} alt="Selected Preview" />
        </div>

        {/* 등록 버튼 */}
        <button type="submit">등록</button>
      </form>
    </div>
  );
}

export default WriteForm;
