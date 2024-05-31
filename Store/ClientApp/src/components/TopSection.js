import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TopSection.css';
import sendRequest from './SendRequest';
import MenuSection from './MenuSection';

const TopSection = () => {
    const [user, setUser] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '' });
    const navigate = useNavigate();

    useEffect(() => {
        if (sessionStorage.getItem("userId") === null) {
            sendRequest("/api/User/Check", "GET", null)
                .then(n => {
                    setUser(n);
                    sessionStorage.setItem("userName", n.userName);
                    sessionStorage.setItem("userId", n.userId);
                    sessionStorage.setItem("number", n.number);
                    sessionStorage.setItem("email", n.email);
                    sessionStorage.setItem("role", n.role);
                    sessionStorage.setItem("isAuthenticated", true);

                    if (n.role === 'Admin') {
                        window.location.href = "/administrator/AdminPage";
                    }
                    if (n.role === 'Manager') {
                        window.location.href = "/manager/ManagerPage";
                    }
                }).catch(e => console.error(e));
        }
    }, []);

    const singOut = () => {
        sendRequest("/api/User/singOut", "POST", null)
            .then(() => {
                setUser(null);
                sessionStorage.removeItem("userId");
                sessionStorage.removeItem("email");
                sessionStorage.removeItem("number");
                sessionStorage.removeItem("userName");
                sessionStorage.removeItem("role");
                sessionStorage.removeItem("isAuthenticated");
            })
            .catch(error => console.log(error));
    };

    const handleCartClick = () => {
        if (sessionStorage.getItem("userId") === null) {
            setNotification({ show: true, message: 'Для просмотра корзины необходимо войти в систему.' });
            setTimeout(() => setNotification({ show: false, message: '' }), 3000);
        } else {
            navigate('/user/CartPage');
        }
    };

    return (
        <div className="top-section">
            <Link className="logo" to="/">
                <img src="/images/qq.png" />
            </Link>
            <div className="work-time">
                <div>А1: +375 29 666 66 66</div>
                <div>Работаем без выходных</div>
                <div>C 9:00 до 19:00</div>
            </div>
            <MenuSection />
            <button className="cart-button-on-top-section" onClick={handleCartClick}>
                Корзина
            </button>

            {sessionStorage.getItem("userId") !== null ? (
                <div className="auth-buttons">
                    <Link className="text-dark" to="/user/UserProfilePage">
                        <button>Мой профиль</button>
                    </Link>
                    <Link className="text-dark" to="/">
                        <button onClick={singOut}>Выход</button>
                    </Link>
                </div>
            ) : (
                <div className="auth-buttons">
                    <Link className="text-dark" to="/Authentication/RegisterPage">
                        <button>Регистрация</button>
                    </Link>
                    <Link className="text-dark" to="/Authentication/LoginPage">
                        <button>Авторизация</button>
                    </Link>
                </div>
            )}
            {notification.show && <div className="notification error">{notification.message}</div>}
        </div>
    );
};

export default TopSection;
