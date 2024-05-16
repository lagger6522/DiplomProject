import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import sendRequest from '../SendRequest';
import './style.css';

const CategoryModalContentRemove = ({ onClose }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

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
        setShowConfirmation(true);
    };

    const handleConfirmRemove = () => {
        if (selectedCategory) {
            sendRequest(`/api/Categories/RemoveCategory`, 'DELETE', null, { categoryId: selectedCategory.categoryId })
                .then(response => {
                    console.log('Категория и связанные элементы успешно удалены:', response);
                    setCategories(prevCategories => prevCategories.filter(category => category.categoryId !== selectedCategory.categoryId));
                    setShowConfirmation(false);
                    setSelectedCategory(null);
                    onClose();
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
        </div>
    );
};

CategoryModalContentRemove.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default CategoryModalContentRemove;
