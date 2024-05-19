import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const [userOrders, setUserOrders] = useState([]);
    const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

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

    const handleDeleteOrder = (orderId) => {
        setConfirmDeleteOrderId(orderId);
    };

    const confirmDeleteOrder = async () => {
        try {
            await sendRequest(`/api/Orders/DeleteOrder`, 'POST', null, { orderId: confirmDeleteOrderId });
            setUserOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== confirmDeleteOrderId));
            setConfirmDeleteOrderId(null);
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
        }
    };

    const cancelDeleteOrder = () => {
        setConfirmDeleteOrderId(null);
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrderId((prevOrderId) => (prevOrderId === orderId ? null : orderId));
    };

    return (
        <div className="my-orders-page">
            <h2>Мои заказы</h2>
            {userOrders && userOrders.length > 0 ? (
                <ul>
                    {userOrders.map((order) => (
                        <li key={order.orderId}>
                            <div onClick={() => toggleOrderDetails(order.orderId)}>
                                <strong>Номер заказа:</strong> {order.orderId}
                            </div>
                            <div>
                                <strong>Дата заказа:</strong> {formatReviewDate(order.orderDate)}
                            </div>
                            <div>
                                <strong>Статус заказа:</strong> {order.status}
                            </div>
                            {order.status === 'Заказ обрабатывается' && (
                                <React.Fragment>
                                    <button
                                        className="delete-order-button"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.orderId); }}
                                    >
                                        Удалить заказ
                                    </button>
                                    {confirmDeleteOrderId === order.orderId && (
                                        <div className="confirm-delete-menu">
                                            <p>Вы уверены, что хотите удалить заказ?</p>
                                            <button onClick={confirmDeleteOrder}>Да</button>
                                            <button onClick={cancelDeleteOrder}>Отмена</button>
                                        </div>
                                    )}
                                </React.Fragment>
                            )}
                            {expandedOrderId === order.orderId && (
                                <OrderDetails orderId={order.orderId} />
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>У вас пока нет заказов.</p>
            )}
        </div>
    );
};

const OrderDetails = ({ orderId }) => {
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        sendRequest(`/api/Orders/GetOrderDetails`, 'GET', null, { orderId })
            .then((details) => {
                setOrderDetails(details);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке деталей заказа:', error);
            });
    }, [orderId]);

    if (!orderDetails) {
        return <p>Загрузка...</p>;
    }

    const totalCost = orderDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="order-details">
            <h4>Детали заказа</h4>
            <ul>
                {orderDetails.map((item) => (
                    <li key={item.productId}>
                        <div>{item.productName}</div>
                        <div>Количество: {item.quantity}</div>
                        <div>Цена: {item.price} руб.</div>
                    </li>
                ))}
            </ul>
            <div className="order-total">
                <strong>Итоговая стоимость:</strong> {totalCost} руб.
            </div>
        </div>
    );
};

export default MyOrdersPage;
