import React from 'react';

const OrderButton = ({ onClick }) => {
    return (
        <button className="order-button" onClick={onClick}>
            Перейти к оформлению заказа
        </button>
    );
};

export default OrderButton;