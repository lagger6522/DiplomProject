import React, { useState } from 'react';
import sendRequest from '../SendRequest';
import './style.css';

const CategoryModalContentAdd = ({ onClose }) => {
    const [categoryName, setCategoryName] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const handleSave = () => {
        if (categoryName.trim() === '') {
            setNotification({ show: true, message: 'Поле название категории не может быть пустым!', type: 'error' });
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            return;
        }

        sendRequest('/api/Categories/CreateCategory', 'POST', { categoryName })
            .then(response => {
                console.log('Категория успешно создана:', response);
                setNotification({ show: true, message: 'Категория успешно создана!', type: 'success' });
                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);
            })
            .catch(error => {
                console.error('Ошибка при создании категории:', error);
                setNotification({ show: true, message: 'Такая категория уже существует!', type: 'error' });
                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);
            });
    };

    return (
        <div>
            <h3>Добавить категорию</h3>
            <label htmlFor="categoryName">Название категории:</label>
            <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
            />
            <button onClick={handleSave}>Сохранить</button>
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default CategoryModalContentAdd;
