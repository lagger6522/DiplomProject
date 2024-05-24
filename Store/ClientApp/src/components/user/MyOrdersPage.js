import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
    const [userOrders, setUserOrders] = useState([]);
    const [orderDetails, setOrderDetails] = useState({});
    const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState(null);

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

    const fetchOrderDetails = (orderId) => {
        sendRequest(`/api/Orders/GetOrderDetails?orderId=${orderId}`)
            .then((details) => {
                setOrderDetails(prevDetails => ({ ...prevDetails, [orderId]: details }));
            })
            .catch((error) => {
                console.error('Ошибка при загрузке деталей заказа:', error);
            });
    };

    const toggleOrderDetails = (orderId) => {
        if (orderDetails[orderId]) {
            setOrderDetails(prevDetails => {
                const newDetails = { ...prevDetails };
                delete newDetails[orderId];
                return newDetails;
            });
        } else {
            fetchOrderDetails(orderId);
        }
    };

    return (
        <div className="my-orders-page">
            <h2>Мои заказы</h2>
            {userOrders && userOrders.length > 0 ? (
                <ul>
                    {userOrders.map((order) => (
                        <li key={order.orderId} onClick={() => toggleOrderDetails(order.orderId)}>
                            <div>
                                <strong>Номер заказа:</strong> {order.orderId}
                            </div>
                            <div>
                                <strong>Дата заказа:</strong> {formatReviewDate(order.orderDate)}
                            </div>
                            <div>
                                <strong>Статус заказа:</strong> {order.status}
                            </div>
                            <div>
                                <strong>Адрес доставки:</strong> {order.deliveryAddress}
                            </div>
                            {order.status === 'Заказ обрабатывается' && (
                                <React.Fragment>
                                    <button
                                        className="delete-order-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteOrder(order.orderId);
                                        }}
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
                            {orderDetails[order.orderId] && (
                                <div className="order-details">
                                    <h4>Детали заказа</h4>
                                    <ul>
                                        {orderDetails[order.orderId].orderItems.map(item => (
                                            <li key={item.productId}>
                                                <div><strong>Продукт:</strong> {item.productName}</div>
                                                <div><strong>Количество:</strong> {item.quantity}</div>
                                                <div><strong>Цена:</strong> {item.priceAtOrder}</div>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="order-total">
                                        <strong>Итоговая стоимость:</strong> {orderDetails[order.orderId].totalOrderPrice}
                                    </div>
                                </div>
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

export default MyOrdersPage;
