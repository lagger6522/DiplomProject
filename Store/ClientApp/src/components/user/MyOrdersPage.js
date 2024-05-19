import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const [userOrders, setUserOrders] = useState([]);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');

        if (userId) {
            sendRequest(`/api/User/GetOrdersByUserId?userId=${userId}`)
                .then((orders) => {
                    const sortedOrders = sortOrders(orders || []);
                    setUserOrders(sortedOrders);
                })
                .catch((error) => {
                    console.error('Ошибка при загрузке заказов:', error);
                });
        }
    }, []);

    const sortOrders = (orders) => {
        const statusOrder = {
            'Заказ обрабатывается': 1,
            'Заказ готов к отправке': 2,
            'Заказ доставлен': 3,
        };

        return orders.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    };

    const formatReviewDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    return (
        <div className="my-orders-page">
            <h2>Мои заказы</h2>
            {userOrders && userOrders.length > 0 ? (
                <ul>
                    {userOrders.map((order) => (
                        <li key={order.orderId}>
                            <div>
                                <strong>Номер заказа:</strong> {order.orderId}
                            </div>
                            <div>
                                <strong>Дата заказа:</strong> {formatReviewDate(order.orderDate)}
                            </div>
                            <div>
                                <strong>Статус заказа:</strong> {order.status}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>У вас пока нет заказов.</p>
            )}
        </div>
    );
};

export default MyOrdersPage;
