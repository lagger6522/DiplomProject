import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import sendRequest from './SendRequest';
import './BestSellers.css';

const BestSellers = () => {
    const [bestSellersData, setBestSellersData] = useState([]);
    const [cartQuantities, setCartQuantities] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        sendRequest('/api/Products/GetBestSellers', 'GET', null, null)
            .then(data => {
                setBestSellersData(data);
                initializeQuantities(data);
            })
            .catch(error => console.error('Error fetching best sellers:', error));
    }, []);

    const initializeQuantities = (products) => {
        const initialQuantities = {};
        products.forEach(product => {
            initialQuantities[product.id] = 1;
        });
        setCartQuantities(initialQuantities);
    };

    const handleQuantityChange = (productId, amount) => {
        setCartQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: Math.max(prevQuantities[productId] + amount, 1),
        }));
    };

    const handleAddToCart = (productId) => {
        const quantity = cartQuantities[productId];
        var userId = sessionStorage.getItem("userId");

        if (!userId) {
            setError('Для добавления товара в корзину необходимо войти в систему.');
            return;
        }

        sendRequest('/api/Cart/AddToCart', 'POST', {
            productId,
            userId,
            quantity,
        })
            .then(response => {
                console.log('Товар успешно добавлен в корзину:', response);
                setCartQuantities(prevQuantities => ({
                    ...prevQuantities,
                    [productId]: 1,
                }));
            })
            .catch(error => {
                console.error('Ошибка при добавлении товара в корзину:', error);
            });
    };

    return (
        <div className="best-sellers">
            {error && <div className="error-message">{error}</div>}
            <h2>Лидеры продаж</h2>
            <div className="product-list">
                {bestSellersData.map((product) => (
                    <div key={product.id} className="product-item">
                        <Link className="no-line" to={`/product-details/${product.id}`}>
                            <img src={product.image} alt={product.name} className="product-image" />
                        </Link>
                        <div className="product-details">
                            <Link className="no-line" to={`/product-details/${product.id}`}>
                                <h3>{product.name}</h3>
                            </Link>
                            <div>
                                <span>Оценка: {product.rating.toFixed(1)}</span>
                                <span>({product.reviews} отзыва(ов))</span>
                            </div>
                            <div className="cost">Цена: {product.price} руб.</div>
                            <div className="cart-controls">
                                <button className="counter-button" onClick={() => handleQuantityChange(product.id, -1)}>-</button>
                                <input type="number" value={cartQuantities[product.id]} readOnly />
                                <button className="counter-button" onClick={() => handleQuantityChange(product.id, 1)}>+</button>
                                <button className="cart-button" onClick={() => handleAddToCart(product.id)}>В корзину</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BestSellers;
