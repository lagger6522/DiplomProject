import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const orders = await sendRequest('/api/Orders/GetAllOrders', 'GET');
            const sortedOrders = sortOrders(orders);
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const sortOrders = (orders) => {
        const statusOrder = {
            'Заказ обрабатывается': 1,
            'Заказ готов к отправке': 2,
            'Заказ доставлен': 3,
        };

        return orders.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await sendRequest('/api/Orders/UpdateOrderStatus', 'POST', { orderId, status: newStatus });
            setOrders(prevOrders =>
                sortOrders(prevOrders.map(order =>
                    order.orderId === orderId ? { ...order, status: newStatus } : order
                ))
            );
            console.log(`Changed status of order ${orderId} to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    return (
        <div>
            <h1>История заказов</h1>
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
                                <option value="Заказ выполнен">Заказ выполнен</option>
                            </select>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OrderHistory;
