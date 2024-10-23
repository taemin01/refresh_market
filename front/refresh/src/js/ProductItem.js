import React from 'react';
import '../css/ProductItem.css'; // 스타일 파일도 필요에 따라 추가

const ProductItem = ({ image, name, price }) => { // props 추가
  return (
    <div className="product-item">
      <img src={image} alt={name} className="product-image" />
      <h3 className="product-name">{name}</h3>
      <p className="product-price">{price}</p>
    </div>
  );
};

export default ProductItem;
