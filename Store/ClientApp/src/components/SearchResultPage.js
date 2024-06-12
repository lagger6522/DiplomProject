import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import sendRequest from './SendRequest';
import ProductItem from './ProductItem';
import './ProductPage.css';

const SearchResultPage = () => {
    const location = useLocation();
    const [searchResults, setSearchResults] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [sortOption, setSortOption] = useState('price');
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
        const userId = sessionStorage.getItem("userId");

        if (!userId) {
            setNotification({ show: true, message: 'Для добавления товара в корзину необходимо войти в систему.', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }
        sendRequest('/api/Cart/AddToCart', 'POST', {
            productId,
            userId,
            quantity,
        })
            .then(response => {
                console.log('Товар успешно добавлен в корзину:', response);
                setNotification({ show: true, message: 'Товар успешно добавлен в корзину!', type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            })
            .catch(error => {
                console.error('Ошибка при добавлении товара в корзину:', error);
                setNotification({ show: true, message: 'Ошибка при добавлении товара в корзину: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
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
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            <div>
                <label>Сортировка по:</label>
                <select value={sortOption} onChange={handleSortChange}>
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
                    <ProductItem
                        key={result.productId}
                        product={result}
                        quantity={quantities[result.productId]}
                        onQuantityChange={handleQuantityChange}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </div>
        </div>
    );
};

export default SearchResultPage;
