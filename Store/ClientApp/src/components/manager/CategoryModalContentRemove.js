import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import sendRequest from '../SendRequest';
import './style.css';

const CategoryModalContentRemove = ({ onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        // Загрузка списка категорий при открытии модального окна
        sendRequest('/api/Categories/GetCategories', 'GET', null, null)
            .then(response => {
                setCategories(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке категорий:', error);
            });
    }, [setCategories]);

    const handleCategoryChange = (selectedCategoryId) => {
        const category = categories.find(category => category.categoryId === parseInt(selectedCategoryId, 10));
        setSelectedCategory(category);
        setShowConfirmation(false); // Сбрасываем состояние подтверждения при смене категории
    };

    const handleRemove = () => {
        setShowConfirmation(true); // Показываем окно подтверждения
    };

    const handleConfirmRemove = () => {
        if (selectedCategory) {
            // Отправка запроса на сервер для удаления категории и связанных элементов
            sendRequest(`/api/Categories/RemoveCategory`, 'DELETE', null, { categoryId: selectedCategory.categoryId })
                .then(response => {
                    // Обработка успешного ответа от сервера
                    console.log('Категория и связанные элементы успешно удалены:', response);
                    // Обновление списка категорий после удаления
                    setCategories(prevCategories => prevCategories.filter(category => category.categoryId !== selectedCategory.categoryId));
                    setShowConfirmation(false); // Закрываем окно подтверждения
                    setSelectedCategory(null); // Сбрасываем выбранную категорию
                    onClose();
                })
                .catch(error => {
                    // Обработка ошибки при удалении
                    console.error('Ошибка при удалении категории и связанных элементов:', error);
                    setShowConfirmation(false); // Закрываем окно подтверждения в случае ошибки
                });
        }
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false); // Закрываем окно подтверждения
    };

    return (
        <div>
            <h3>Удалить категорию и связанные элементы</h3>
            <label htmlFor="selectedCategory">Выберите категорию:</label>
            <select
                id="selectedCategory"
                value={selectedCategory ? selectedCategory.categoryId : ''}
                onChange={(e) => handleCategoryChange(e.target.value)}
            >
                <option value="" disabled>Выберите категорию</option>
                {categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
                ))}
            </select>
            <button onClick={handleRemove}>Удалить</button>

            {/* Модальное окно для подтверждения */}
            {showConfirmation && (
                <div className="confirmation-modal">
                    <p>Вы уверены, что хотите удалить категорию и связанные элементы?</p>
                    <button onClick={handleConfirmRemove}>Да</button>
                    <button onClick={handleCancelRemove}>Отмена</button>
                </div>
            )}
        </div>
    );
};

CategoryModalContentRemove.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default CategoryModalContentRemove;
