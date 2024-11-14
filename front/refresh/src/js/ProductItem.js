import React from 'react';
import '../css/ProductItem.css'; // 스타일 파일도 필요에 따라 추가
import {useNavigate} from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => { // props 추가
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="product-item"onClick={handleClick} style={{ cursor: 'pointer' }}>
      <img src={image} alt={name} className="product-image" />
      <h3 className="product-name">{name}</h3>
      <p className="product-price">{price}</p>
    </div>
  );
};

export default ProductItem;
