import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './OrderHistory.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

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
            'Заказ выполнен': 3,
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
            setNotification({ show: true, message: `Статус заказа ${orderId} изменен на "${newStatus}"`, type: 'success' });
        } catch (error) {
            console.error('Error updating order status:', error);
            setNotification({ show: true, message: 'Ошибка при обновлении статуса заказа.', type: 'error' });
        } finally {
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        }
    };

    return (
        <div className="order-history">
            <h1>История заказов</h1>

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <ul className="order-list">
                {orders.map(order => (
                    <li key={order.orderId} className="order-item">
                        <p>Идентификатор заказа: {order.orderId}</p>
                        <p>Дата заказа: {new Date(order.orderDate).toLocaleDateString()}</p>
                        <p>Адрес доставки: {order.deliveryAddress}</p>
                        <p>Статус: {order.status}</p>
                        <label className="status-change">
                            Изменить статус:
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                                className="form-control"
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
