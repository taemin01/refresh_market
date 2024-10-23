import React from 'react';
import ProductItem from './ProductItem'; // 경로 확인
import '../css/ProductList.css'; // 스타일 파일은 필요에 따라 생성

const products = [
  { id: 1, name: '나메코 인형', price: '30,000원', image: require('../image/nameko.jpg') },
  { id: 2, name: '파란 모자', price: '10,000원', image: require('../image/hat.jpg') },
  { id: 3, name: '삼성 노트북', price: '1,200,000원', image: require('../image/laptop.jpg') },
  { id: 4, name: '메신저백', price: '20,000원', image: require('../image/bag.jpg') },
  { id: 5, name: '나메코 인형', price: '30,000원', image: require('../image/nameko.jpg') },
  { id: 6, name: '파란 모자', price: '10,000원', image: require('../image/hat.jpg') },
  { id: 7, name: '삼성 노트북', price: '1,200,000원', image: require('../image/laptop.jpg') },
  { id: 8, name: '메신저백', price: '20,000원', image: require('../image/bag.jpg') }
];


function ProductList() {
  return (
    <div>
      <div className="product-header">
        <h2>지금 막 등록된 상품들이에요</h2>
      </div>
      <div className="product-list">
        {products.map(product => (
          <ProductItem
            key={product.id}
            image={product.image}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductList;

