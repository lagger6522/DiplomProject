import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './style.css';

const CategoryModalContentEdit = () => {
    const [categoryName, setCategoryName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
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
        setCategoryName(category ? category.categoryName : '');
    };

    const handleSave = () => {
        if (!selectedCategory) {
            setNotification({ show: true, message: 'Выберите категорию!', type: 'error' });
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            return;
        }

        if (categoryName.trim() === '') {
            setNotification({ show: true, message: 'Новое название категории не может быть пустым!', type: 'error' });
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            return;
        }

        const existingCategory = categories.find(category => category.categoryName === categoryName && !category.isDeleted);
        if (existingCategory) {
            setNotification({ show: true, message: 'Категория с таким названием уже существует!', type: 'error' });
            setTimeout(() => {
                setNotification({ show: false, message: '', type: '' });
            }, 3000);
            return;
        }

        sendRequest(`/api/Categories/EditCategory`, 'PUT', { categoryName }, { categoryId: selectedCategory.categoryId })
            .then(response => {
                console.log('Категория успешно обновлена:', response);
                setNotification({ show: true, message: 'Категория успешно обновлена!', type: 'success' });
                setTimeout(() => {
                    setNotification({ show: false, message: '', type: '' });
                }, 3000);

                sendRequest('/api/Categories/GetCategories', 'GET', null, null)
                    .then(updatedCategories => {
                        setCategories(updatedCategories);
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке категорий после обновления:', error);
                    });
            })
            .catch(error => {
                console.error('Ошибка при обновлении категории:', error);
            });
    };

    return (
        <div className="align-column">
            <h3>Редактировать категорию</h3>
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
            <label htmlFor="categoryName">Новое название категории:</label>
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

export default CategoryModalContentEdit;
