import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from './CartItem';
import OrderButton from './OrderButton';
import sendRequest from '../SendRequest';
import './CartPage.css';

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId');
    const [hasItems, setHasItems] = useState(true);

    useEffect(() => {
        if (userId) {
            sendRequest(`/api/Cart/GetCartItems`, 'GET', null, { userId })
                .then(response => {
                    setCartItems(response);
                    setHasItems(response.length > 0);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке товаров в корзине:', error);
                });
        }
    }, [userId]);

    const handleQuantityChange = async (productId, newQuantity) => {
        try {
            await sendRequest(`/api/Cart/UpdateCartItemQuantity`, 'POST', {
                userId: userId,
                productId: productId,
                quantity: newQuantity,
            });

            const updatedCartItems = cartItems.map(item => {
                if (item.product.productId === productId) {
                    return {
                        ...item,
                        quantity: newQuantity,
                    };
                }
                return item;
            });

            setCartItems(updatedCartItems);
        } catch (error) {
            console.error('Ошибка при обновлении количества товара:', error);
        }
    };

    const handleRemoveFromCart = async (productId) => {
        try {
            await sendRequest(`/api/Cart/RemoveCartItem`, 'POST', {
                userId: userId,
                productId: productId,
            });

            const updatedCartItems = cartItems.filter(item => item.product.productId !== productId);
            setCartItems(updatedCartItems);
            setHasItems(updatedCartItems.length > 0);

            localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        } catch (error) {
            console.error('Ошибка при удалении товара из корзины:', error);
        }
    };

    const handleOrderButtonClick = () => {
        navigate('/order-form');
    };

    return (
        <div className="cart-page">
            <h2>Корзина</h2>
            {userId && !hasItems && (
                <div className="notification">
                    <p>Ваша корзина пуста.</p>
                </div>
            )}
            {userId && hasItems && (
                <div>
                    <div className="cart-items">
                        <div className="cart-item-header">
                            <p className="column1">Товар</p>
                            <p className="column2">Цена</p>
                            <p className="column3">Количество</p>
                            <p className="column4">Сумма</p>
                        </div>
                        {cartItems && cartItems.map((item) => (
                            <CartItem
                                key={item.productId}
                                product={item.product}
                                quantity={item.quantity}
                                handleQuantityChange={handleQuantityChange}
                                handleRemoveFromCart={handleRemoveFromCart}
                            />
                        ))}
                    </div>
                    <OrderButton onClick={handleOrderButtonClick} />
                </div>
            )}
        </div>
    );
};

export default CartPage;
 