import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios'; // axios 임포트
import '../css/SearchResult.css';

export default function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const keyword = queryParams.get('keyword'); // URL에서 keyword 파라미터 추출

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    console.log("results : ", results);

    // 검색 결과 가져오기
    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true); // 로딩 상태 활성화
            setResults([]); // 이전 검색 결과 초기화
            setError(null); // 이전 오류 상태 초기화

            if (keyword) {
                try {
                    // axios를 사용하여 백엔드에서 검색 결과 가져오기
                    const response = await axios.get(`http://localhost:8080/search/name`, {
                        params: { keyword }, // URL 파라미터로 keyword 전달
                    });
                    if (response.data.length === 0) {
                        setError('검색 결과가 없습니다.');
                    } else {
                        setResults(response.data); // 검색 결과 상태 업데이트
                    }
                } catch (error) {
                    console.error('검색 오류:', error);
                    setError('검색 중 오류가 발생했습니다.');
                } finally {
                    setLoading(false); // 로딩 상태 비활성화
                }
            }
        };

        fetchResults(); // 검색 결과 요청
    }, [keyword]);

    const handlePostClick = (id) => {
        console.log(id);
        navigate(`/product/${id}`);
    }

    return (
        <div className="search-results-container">
            <h3 className="search-results-title">검색 결과</h3>
            {loading ? (
                <p>로딩 중...</p>
            ) : error ? (
                <p>{error}</p>
            ) : results.length > 0 ? (
                <div className="results-list">
                    {results.map((post) => (
                        <div key={post.product_id} className="result-item"
                             onClick={() => handlePostClick(post.product_id)}>
                            <img className="result-item-image" src={`http://localhost:8080${post.image}`} alt="게시글 이미지"/>
                            <div className="result-item-details">
                                <h4 className="result-item-title">{post.title}</h4>
                                <p className="result-item-price">{post.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>검색 결과가 없습니다.</p>
            )}
        </div>
    );
}
