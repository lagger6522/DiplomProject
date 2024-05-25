import React, { useState, useEffect } from 'react';
import sendRequest from './SendRequest';
import ProductItem from './ProductItem';
import './ProductSelection.css';

const ProductSelection = () => {
    const [selectedCategory, setSelectedCategory] = useState('topRated');
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        fetchProducts(selectedCategory);
    }, [selectedCategory]);

    const fetchProducts = (category) => {
        let endpoint = '';

        switch (category) {
            case 'topRated':
                endpoint = '/api/Products/GetTopRatedProducts';
                break;
            case 'bestSellers':
                endpoint = '/api/Products/GetTopRatedProducts';
                break;
            // Добавьте другие категории, если нужно
            default:
                endpoint = '/api/Products/GetTopRatedProducts';
        }

        sendRequest(endpoint, 'GET', null, null)
            .then((response) => {
                setProducts(response);
                const initialQuantities = {};
                response.forEach(product => {
                    initialQuantities[product.productId] = 1; // Default quantity is 1
                });
                setQuantities(initialQuantities);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке товаров:', error);
            });
    };

    const handleQuantityChange = (productId, amount) => {
        setQuantities(prevQuantities => {
            const newQuantity = Math.max(1, (prevQuantities[productId] || 1) + amount);
            return { ...prevQuantities, [productId]: newQuantity };
        });
    };

    const handleAddToCart = (productId) => {
        const quantity = quantities[productId] || 1;
        console.log(`Добавление продукта ID: ${productId}, количество: ${quantity} в корзину.`);
        // Добавьте логику добавления товара в корзину
    };

    return (
        <div className="product-selection">
            <div className="buttons">
                <button
                    className={selectedCategory === 'topRated' ? 'active' : ''}
                    onClick={() => setSelectedCategory('topRated')}
                >
                    Выбор покупателей
                </button>
                <button
                    className={selectedCategory === 'bestSellers' ? 'active' : ''}
                    onClick={() => setSelectedCategory('bestSellers')}
                >
                    Лидеры продаж
                </button>
                {/* Добавьте другие кнопки, если нужно */}
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
        </div>
    );
};

export default ProductSelection;
