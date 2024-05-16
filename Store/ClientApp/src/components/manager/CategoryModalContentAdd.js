import React, { useState } from 'react';
import sendRequest from '../SendRequest';
import './style.css';

const CategoryModalContentAdd = ({ onClose }) => {
    const [categoryName, setCategoryName] = useState('');

    const handleSave = () => {
        sendRequest('/api/Categories/CreateCategory', 'POST', { categoryName })
            .then(response => {
                console.log('Категория успешно создана:', response);

                onClose();
            })
            .catch(error => {
                console.error('Ошибка при создании категории:', error);
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
        </div>
    );
};

export default CategoryModalContentAdd;
