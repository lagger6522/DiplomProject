import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';
import sendRequest from '../SendRequest';

const UserProfilePage = () => {
    const [user, setUser] = useState({ userId: '', userName: '', number: '', email: '' });
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [formData, setFormData] = useState({ userId: '', userName: '', number: '', email: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const notificationRef = useRef(null);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId') || '';
        const userName = sessionStorage.getItem('userName') || '';
        const number = sessionStorage.getItem('number') || '';
        const email = sessionStorage.getItem('email') || '';

        setUser({ userId, userName, number, email });
        setFormData({ userId, userName, number, email });
    }, []);

    useEffect(() => {
        if (notification.show) {
            notificationRef.current.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        }
    }, [notification]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'number' && value.length > 12) {
            setNotification({ show: true, message: 'Номер телефона слишком длинный.', type: 'error' });
            return;
        }
        setFormData({ ...formData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setIsChangingPassword(false);
    };

    const handlePasswordClick = () => {
        setIsEditing(false);
        setIsChangingPassword(true);
    };

    const handleSaveClick = async () => {
        setError('');
        if (!formData.userName.trim()) {
            setNotification({ show: true, message: 'Имя пользователя не может быть пустым.', type: 'error' });
            return;
        }
        if (!formData.email.trim() || !validateEmail(formData.email)) {
            setNotification({ show: true, message: 'Неверный формат email.', type: 'error' });
            return;
        }
        if (!formData.number.trim()) {
            setNotification({ show: true, message: 'Номер телефона не может быть пустым.', type: 'error' });
            return;
        }

        try {
            await sendRequest('/api/User/UpdateProfile', 'POST', formData);
            setUser(formData);
            sessionStorage.setItem('userId', formData.userId);
            sessionStorage.setItem('userName', formData.userName);
            sessionStorage.setItem('number', formData.number);
            sessionStorage.setItem('email', formData.email);
            setIsEditing(false);
            setNotification({ show: true, message: 'Профиль успешно обновлен!', type: 'success' });
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setNotification({ show: true, message: error.response.data.message, type: 'error' });
            } else {
                console.error('Ошибка при сохранении данных:', error);
            }
        }
    };

    const handlePasswordSave = async () => {
        setPasswordError('');
        const { newPassword } = passwordData;
        if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
            setNotification({ show: true, message: 'Пароль должен содержать минимум 8 символов, включая буквы и цифры.', type: 'error' });
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setNotification({ show: true, message: 'Пароли не совпадают.', type: 'error' });
            return;
        }

        try {
            await sendRequest('/api/User/ChangePassword', 'POST', {
                userId: user.userId,
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setIsChangingPassword(false);
            setNotification({ show: true, message: 'Пароль успешно изменен!', type: 'success' });
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setNotification({ show: true, message: error.response.data.message, type: 'error' });
            } else {
                console.error('Ошибка при изменении пароля:', error);
            }
        }
    };

    const handleCancelClick = () => {
        setFormData(user);
        setIsEditing(false);
        setIsChangingPassword(false);
        setError('');
        setPasswordError('');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="user-profile-page">
            <div className="user-profile">
                <h2>Личный кабинет</h2>
                {notification.show && (
                    <div ref={notificationRef} className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}
                {isEditing ? (
                    <>
                        <div>
                            <strong>Имя пользователя:</strong>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                        <div>
                            <strong>E-mail:</strong>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                        <div>
                            <strong>Телефон:</strong>
                            <input
                                type="text"
                                name="number"
                                value={formData.number}
                                onChange={handleInputChange}
                                className="form-control"
                            />
                        </div>
                        <div className="button-group">
                            <button onClick={handleSaveClick} className="btn btn-success">
                                Сохранить
                            </button>
                            <button onClick={handleCancelClick} className="btn btn-secondary">
                                Отмена
                            </button>
                        </div>
                    </>
                ) : isChangingPassword ? (
                    <>
                        <div>
                            <strong>Старый пароль:</strong>
                            <input
                                type="password"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                className="form-control"
                            />
                        </div>
                        <div>
                            <strong>Новый пароль:</strong>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="form-control"
                            />
                        </div>
                        <div>
                            <strong>Подтвердите пароль:</strong>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="form-control"
                            />
                        </div>
                        <div className="button-group">
                            <button onClick={handlePasswordSave} className="btn btn-success">
                                Сохранить
                            </button>
                            <button onClick={handleCancelClick} className="btn btn-secondary">
                                Отмена
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <strong>Имя пользователя:</strong> {user.userName}
                        </div>
                        <div>
                            <strong>E-mail:</strong> {user.email}
                        </div>
                        <div>
                            <strong>Телефон:</strong> {user.number}
                        </div>
                    </>
                )}
            </div>
            <div className="user-menu">
                <div className="button-group">
                    <button onClick={handleEditClick} className="btn btn-primary">
                        Редактировать профиль
                    </button>
                    <button onClick={handlePasswordClick} className="btn btn-secondary">
                        Изменить пароль
                    </button>
                    <button onClick={() => navigate('/my-orders')} className="btn btn-info">
                        Мои заказы
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
