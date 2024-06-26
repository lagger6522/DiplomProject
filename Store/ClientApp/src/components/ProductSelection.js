import React, { useState, useEffect } from 'react';
import sendRequest from './SendRequest';
import ProductItem from './ProductItem';
import './ProductSelection.css';

const ProductSelection = () => {
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    sendRequest('/api/Products/GetTopRatedProducts', 'GET', null, null)
        .then((response) => {
            setProducts(response);
            initializeQuantities(response);
        })
        .catch((error) => {
            setNotification({ show: true, message: 'Ошибка при загрузке товаров: ' + error.message, type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        });

    const initializeQuantities = (products) => {
        const initialQuantities = {};
        products.forEach(product => {
            initialQuantities[product.productId] = 1;
        });
        setQuantities(initialQuantities);
    };

    const handleQuantityChange = (productId, amount) => {
        setQuantities(prevQuantities => {
            const newQuantity = Math.max(1, (prevQuantities[productId] || 1) + amount);
            return { ...prevQuantities, [productId]: newQuantity };
        });
    };

    const handleAddToCart = (productId) => {
        const quantity = quantities[productId] || 1;
        var userId = sessionStorage.getItem("userId");

        if (!userId) {
            setNotification({ show: true, message: 'Для добавления товара в корзину необходимо войти в систему.', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        setNotification('');
        sendRequest('/api/Cart/AddToCart', 'POST', {
            productId,
            userId,
            quantity,
        })
            .then(response => {
                console.log('Товар успешно добавлен в корзину:', response);
            })
            .catch(error => {
                setNotification({ show: true, message: 'Ошибка при добавлении товара в корзину: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    };

    return (
        <div className="product-selection">
            <div className="buttons">
                <h2>Выбор покупателей</h2>
            </div>
            <div className="products">
                {products.map((product) => (
                    <ProductItem
                        key={product.productId}
                        product={product}
                        quantity={quantities[product.productId] || 1}
                        onQuantityChange={handleQuantityChange}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </div>
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default ProductSelection;
