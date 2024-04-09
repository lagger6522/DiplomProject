import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';
import sendRequest from '../SendRequest';

const UserProfilePage = () => {
    const navigate = useNavigate();

    var userName = sessionStorage.getItem("userName");
    var number = sessionStorage.getItem("number");
    var email = sessionStorage.getItem("email");

    const handleMyOrdersClick = () => {
        navigate('/my-orders');
    };

    return (
        <div className="user-profile-page">
            <div className="user-profile">
                <h2>Личный кабинет</h2>
                <div>
                    <strong>Имя пользователя:</strong> {userName}
                </div>
                <div>
                    <strong>E-mail:</strong> {email}
                </div>
                <div>
                    <strong>Телефон:</strong> {number}
                </div>
            </div>
            <div className="user-menu">
                <button onClick={handleMyOrdersClick}>Мои заказы</button>
            </div>
        </div>
    );
};

export default UserProfilePage;
