import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductItem from './ProductItem';
import '../css/ProductList.css';

function ProductList() {
  const [products, setProducts] = useState([]); // 상품 목록 상태
  console.log("상품 목록 상태와 정보", products);

  useEffect(() => {
    // 상품 목록을 서버에서 받아오는 함수
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/product/list'); // 서버 API 호출
        setProducts(response.data); // 받아온 데이터로 상태 업데이트

      } catch (error) {
        console.error('상품 목록을 불러오는 데 실패했습니다:', error);
      }
    };

    fetchProducts(); // 컴포넌트가 마운트되면 호출
  }, []); // 빈 배열로 한 번만 실행

  return (
    <div>
      <div className="product-header">
        <h2>지금 막 등록된 상품들이에요</h2>
      </div>
      <div className="product-list">
        {products.length > 0 ? (
          products.map(product => (
            <ProductItem
              key={product.product_id}  // 제품 ID를 key로 사용
              id={product.product_id}
              image={`http://localhost:8080${product.image}`} // 서버에서 받은 이미지 경로
              name={product.title} // 서버에서 받은 제품 제목
              // discription={product.discription}
              price={product.price} // 서버에서 받은 가격
            />
          ))
        ) : (
          <p>상품 목록을 불러오는 중입니다...</p> // 상품이 없을 경우 로딩 표시
        )}
      </div>
    </div>
  );
}

export default ProductList;