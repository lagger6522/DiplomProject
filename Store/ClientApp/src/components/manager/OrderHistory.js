import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        sendRequest('/api/Orders/GetAllOrders', 'GET', null, null)
            .then(orders => {
                setOrders(orders)
            })
            .catch(error => console.error('Error fetching orders:', error));
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await sendRequest('/api/Orders/UpdateOrderStatus', 'POST', { orderId, status: newStatus });
            // Обновите локальный state или запросите данные заново для обновления интерфейса
            sendRequest('/api/Orders/GetAllOrders', 'GET', null, null)
                .then(orders => {
                    setOrders(orders)
                })
                .catch(error => console.error('Error fetching orders:', error));
            console.log(`Changed status of order ${orderId} to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    return (
        <div>
            <h1>Order History</h1>
            <ul>
                {orders.map(order => (
                    <li key={order.orderId}>
                        <p>Order ID: {order.orderId}</p>
                        <p>Order Date: {order.orderDate}</p>
                        <p>Delivery Address: {order.deliveryAddress}</p>
                        <p>Status: {order.status}</p>
                        <label>
                            Change Status:
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            >
                                <option value="Заказ обрабатывается">Заказ обрабатывается</option>
                                <option value="Заказ готов к отправке">Заказ готов к отправке</option>
                                <option value="Заказ доставлен">Заказ доставлен</option>
                            </select>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderHistory;
