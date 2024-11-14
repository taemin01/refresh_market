import React from 'react';
import '../css/ProductDetail.css';
import namekoImage from '../image/nameko.jpg';


const ProductDetail = ({ product }) => {
    // 더미 데이터 (예시로 사용)
    const dummyProduct = {
        id: 1,
        name: '예시 나메코',
        description: '나메코 인형 입니다.',
        price: '20,000',
        image: namekoImage, // 이미지 URL
    };

    // product prop이 없을 경우 더미 데이터 사용
    const { name, description, price, image } = product || dummyProduct;

    return (
        <div className="product-deatail">
            <img src={image} alt={name} className="productdetail-image" />
            <div className="productdetail-info">
                <h2>{name}</h2>
                <p className="productdetail-price">{price}</p>
             <p className="productdetail-description">{description}</p>
                <button className="buy-button">거래하기</button>
            </div>
        </div>
    );
};

export default ProductDetail;