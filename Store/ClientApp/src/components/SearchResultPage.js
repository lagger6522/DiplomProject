import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import sendRequest from './SendRequest';
import './ProductPage.css';

const SearchResultPage = () => {
    const location = useLocation();
    const [searchResults, setSearchResults] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [error, setError] = useState('');
    const [sortOption, setSortOption] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    useEffect(() => {
        if (location.state && location.state.searchResults) {
            const results = location.state.searchResults;
            applySorting(results);
            initializeQuantities(results);
        }
    }, [location.state, sortOption, sortDirection]);

    const initializeQuantities = (results) => {
        const initialQuantities = {};
        results.forEach(result => {
            initialQuantities[result.productId] = 1;
        });
        setQuantities(initialQuantities);
    };

    const applySorting = (results) => {
        let sortedResults = [...results];

        switch (sortOption) {
            case 'name':
                sortedResults.sort((a, b) => a.productName.localeCompare(b.productName));
                break;
            case 'price':
                sortedResults.sort((a, b) => a.price - b.price);
                break;
            case 'rating':
                sortedResults.sort((a, b) => b.averageRating - a.averageRating);
                break;
            default:
                break;
        }

        if (sortDirection === 'desc') {
            sortedResults.reverse();
        }

        setSearchResults(sortedResults);
    };

    const handleQuantityChange = (productId, amount) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: Math.max(prevQuantities[productId] + amount, 1),
        }));
    };

    const handleAddToCart = (productId) => {
        const quantity = quantities[productId];
        var userId = sessionStorage.getItem("userId");

        if (!userId) {
            setError('Для добавления товара в корзину необходимо войти в систему.');
            return;
        }
        sendRequest('/api/Categories/AddToCart', 'POST', {
            productId,
            userId,
            quantity,
        })
            .then(response => {
                console.log('Товар успешно добавлен в корзину:', response);
            })
            .catch(error => {
                console.error('Ошибка при добавлении товара в корзину:', error);
            });
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleDirectionChange = (e) => {
        setSortDirection(e.target.value);
    };

    if (searchResults.length === 0) {
        return (
            <div className="product-page">
                <h2>Результаты поиска</h2>
                <p>Ничего не найдено.</p>
            </div>
        );
    }

    return (
        <div className="product-page">
            <div>
                <label>Сортировка по:</label>
                <select value={sortOption} onChange={handleSortChange}>
                    <option value="name">Имени</option>
                    <option value="price">Цене</option>
                    <option value="rating">Рейтингу</option>
                </select>
                <label>Направление:</label>
                <select value={sortDirection} onChange={handleDirectionChange}>
                    <option value="asc">По возрастанию</option>
                    <option value="desc">По убыванию</option>
                </select>
            </div>
            <h2>Результаты поиска</h2>
            <div className="product-list">
                {searchResults.map((result) => (
                    <div key={result.productId} className="product-item">
                        <Link className="no-line" to={`/product-details/${result.productId}`}>
                            <img src={result.image} className="product-image" alt={result.productName} />
                        </Link>
                        <div className="product-details">
                            <Link className="no-line" to={`/product-details/${result.productId}`}>
                                <h5>{result.productName}</h5>
                            </Link>
                            <div>
                                <span>Оценка: {result.averageRating !== undefined ? result.averageRating.toFixed(1) : 'Нет оценки'}</span>
                                <span>({result.reviewCount !== undefined ? result.reviewCount : 0} отзыва(ов))</span>
                            </div>
                            <div className="cost">Цена: {result.price} руб.</div>
                            <div className="cart-controls">
                                <button className="counter-button" onClick={() => handleQuantityChange(result.productId, -1)}>-</button>
                                <input type="number" value={quantities[result.productId]} readOnly />
                                <button className="counter-button" onClick={() => handleQuantityChange(result.productId, 1)}>+</button>
                                <button className="cart-button" onClick={() => handleAddToCart(result.productId)}>В корзину</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResultPage;