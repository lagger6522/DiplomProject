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
        sendRequest('/api/Products/GetTopRatedProducts', 'GET', null, null)
            .then((response) => {
                setProducts(response);
                initializeQuantities(response);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке товаров:', error);
            });
    };

    const initializeQuantities = (products) => {
        const initialQuantities = {};
        products.forEach(product => {
            initialQuantities[product.productID] = 1;
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
            console.log('Для добавления товара в корзину необходимо войти в систему.');
            return;
        }
        sendRequest('/api/Cart/AddToCart', 'POST', {
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

    return (
        <div className="product-selection">
            <div className="buttons">
                <h2>Выбор покупателей</h2>
            </div>
            <div className="products">
                {products.map((product) => (
                    <ProductItem
                        key={product.productID}
                        product={product}
                        quantity={quantities[product.productID] || 1}
                        onQuantityChange={handleQuantityChange}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductSelection;
