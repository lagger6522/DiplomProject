import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import sendRequest from '../SendRequest';
import './style.css';

const SubcategoryModalContentRemove = ({ onClose }) => {
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        // Загрузка списка подкатегорий при открытии модального окна
        sendRequest('/api/Categories/GetSubcategories', 'GET', null, null)
            .then(response => {
                setSubcategories(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке подкатегорий:', error);
            });
    }, [setSubcategories]);

    const handleSubcategoryChange = (selectedSubcategoryId) => {
        const subcategory = subcategories.find(subcategory => subcategory.subcategoryId === parseInt(selectedSubcategoryId, 10));
        setSelectedSubcategory(subcategory);
        setShowConfirmation(false); // Сбрасываем состояние подтверждения при смене подкатегории
    };

    const handleRemove = () => {
        setShowConfirmation(true); // Показываем окно подтверждения
    };

    const handleConfirmRemove = () => {
        if (selectedSubcategory) {
            // Отправка запроса на сервер для удаления подкатегории и связанных товаров
            sendRequest(`/api/Categories/RemoveSubcategory`, 'DELETE', null, { subcategoryId: selectedSubcategory.subcategoryId })
                .then(response => {
                    // Обработка успешного ответа от сервера
                    console.log('Подкатегория и связанные товары успешно удалены:', response);
                    // Обновление списка подкатегорий после удаления
                    setSubcategories(prevSubcategories => prevSubcategories.filter(subcategory => subcategory.subcategoryId !== selectedSubcategory.subcategoryId));
                    setShowConfirmation(false); // Закрываем окно подтверждения
                    setSelectedSubcategory(null); // Сбрасываем выбранную подкатегорию
                    onClose();
                })
                .catch(error => {
                    // Обработка ошибки при удалении
                    console.error('Ошибка при удалении подкатегории и связанных товаров:', error);
                    setShowConfirmation(false); // Закрываем окно подтверждения в случае ошибки
                });
        }
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false); // Закрываем окно подтверждения
    };

    return (
        <div>
            <h3>Удалить подкатегорию и связанные товары</h3>
            <label htmlFor="selectedSubcategory">Выберите подкатегорию:</label>
            <select
                id="selectedSubcategory"
                value={selectedSubcategory ? selectedSubcategory.subcategoryId : ''}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
            >
                <option value="" disabled>Выберите подкатегорию</option>
                {subcategories.map(subcategory => (
                    <option key={subcategory.subcategoryId} value={subcategory.subcategoryId}>{subcategory.subcategoryName}</option>
                ))}
            </select>
            <button onClick={handleRemove}>Удалить</button>

            {/* Модальное окно для подтверждения */}
            {showConfirmation && (
                <div className="confirmation-modal">
                    <p>Вы уверены, что хотите удалить подкатегорию и связанные товары?</p>
                    <button onClick={handleConfirmRemove}>Да</button>
                    <button onClick={handleCancelRemove}>Отмена</button>
                </div>
            )}
        </div>
    );
};

SubcategoryModalContentRemove.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default SubcategoryModalContentRemove;
