import React from 'react';
import '../css/ProductItem.css'; // 스타일 파일도 필요에 따라 추가
import {useNavigate} from 'react-router-dom';

const ProductItem = ({ id, image, name, price }) => { // props 추가
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/product/${id}`);
    };

    // image가 이미 'http'로 시작하면 그대로 사용, 아니면 localhost:8080 경로를 붙임
    const imageUrl = image && !image.startsWith('http')
        ? `http://localhost:8080${image}`
        : image;

    console.log('Image URL:', imageUrl);  // 이미지 URL 로깅 (디버깅용)

    return (
        <div className="product-item" onClick={handleClick} style={{ cursor: 'pointer' }}>
            {imageUrl ? (
                <img
                    src={imageUrl} // 경로 확인
                    alt={name}
                    className="product-image"
                />
            ) : (
                <p>이미지 없음</p> // 이미지가 없을 경우 표시
            )}

            <h3 className="product-name">{name}</h3>
            <p className="product-price">{price}</p>
        </div>
    );
};

export default ProductItem;
