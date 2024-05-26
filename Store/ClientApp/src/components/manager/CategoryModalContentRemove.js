import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './style.css';

const CategoryModalContentRemove = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
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
        setShowConfirmation(false);
    };

    const handleRemove = () => {
        if (!selectedCategory) {
            setNotification({ show: true, message: 'Выберите категорию!', type: 'error' });
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            return;
        }

        setShowConfirmation(true);
    };

    const handleConfirmRemove = () => {
        if (selectedCategory) {
            sendRequest(`/api/Categories/RemoveCategory`, 'PUT', null, { categoryId: selectedCategory.categoryId })
                .then(response => {
                    console.log('Категория и связанные элементы успешно удалены:', response);
                    setCategories(prevCategories => prevCategories.filter(category => category.categoryId !== selectedCategory.categoryId));
                    setShowConfirmation(false);
                    setSelectedCategory(null);
                    setNotification({ show: true, message: 'Категория и связанные элементы успешно удалены!', type: 'success' });
                    setTimeout(() => {
                        setNotification({ show: false, message: '', type: '' });
                    }, 3000);
                })
                .catch(error => {
                    console.error('Ошибка при удалении категории и связанных элементов:', error);
                    setShowConfirmation(false);
                });
        }
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false);
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

            {showConfirmation && (
                <div className="confirmation-modal">
                    <p>Вы уверены, что хотите удалить категорию и связанные элементы?</p>
                    <button onClick={handleConfirmRemove}>Да</button>
                    <button onClick={handleCancelRemove}>Отмена</button>
                </div>
            )}

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default CategoryModalContentRemove;
