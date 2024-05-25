import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './ProductItem.css';

const ProductItem = ({ product, quantity, onQuantityChange, onAddToCart }) => {
    const handleQuantityChange = (amount) => {
        onQuantityChange(product.productId, amount);
    };

    const handleAddToCart = () => {
        onAddToCart(product.productId);
    };

    return (
        <div className="product-item">
            <Link className="no-line" to={`/product-details/${product.productId}`}>
                <img src={product.image} className="product-image" alt={product.productName} />
            </Link>
            <div className="product-details">
                <Link className="no-line" to={`/product-details/${product.productId}`}>
                    <h5>{product.productName}</h5>
                </Link>
                <div>
                    <span>Оценка: {product.averageRating !== undefined ? product.averageRating.toFixed(2) : 'Нет оценки'}</span>
                    <span>({product.reviewCount !== undefined ? product.reviewCount : 0} отзыва(ов))</span>
                </div>
                <div className="cost">Цена: {product.price} руб.</div>
                <div className="cart-controls">
                    <button className="counter-button" onClick={() => handleQuantityChange(-1)}>-</button>
                    <input type="number" value={quantity} readOnly />
                    <button className="counter-button" onClick={() => handleQuantityChange(1)}>+</button>
                    <button className="cart-button" onClick={handleAddToCart}>В корзину</button>
                </div>
            </div>
        </div>
    );
};

ProductItem.propTypes = {
    product: PropTypes.object.isRequired,
    quantity: PropTypes.number.isRequired,
    onQuantityChange: PropTypes.func.isRequired,
    onAddToCart: PropTypes.func.isRequired,
};

export default ProductItem;
