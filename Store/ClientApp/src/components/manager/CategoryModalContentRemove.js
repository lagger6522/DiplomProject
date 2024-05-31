import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ProductModalContentAdd.css';

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
    }, []);

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
        <div className="product-modal-content">
            <div className="form-group">
                {notification.show && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}
                <h3>Удалить категорию и связанные элементы</h3>
                <label htmlFor="selectedCategory">Выберите категорию:</label>
                <select
                    id="selectedCategory"
                    value={selectedCategory ? selectedCategory.categoryId : ''}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="form-control"
                >
                    <option value="" disabled>Выберите категорию</option>
                    {categories.map(category => (
                        <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <button onClick={handleRemove} className="btn btn-primary">Удалить</button>
            </div>

            {showConfirmation && (
                <div className="confirmation-modal">
                    <p>Вы уверены, что хотите удалить категорию и связанные элементы?</p>
                    <button onClick={handleConfirmRemove} className="btn btn-primary">Да</button>
                    <button onClick={handleCancelRemove} className="btn btn-secondary">Отмена</button>
                </div>
            )}


        </div>
    );
};

export default CategoryModalContentRemove;
