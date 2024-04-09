import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import sendRequest from '../SendRequest';
import './style.css';

const CategoryModalContentEdit = ({ onClose }) => {
    const [categoryName, setCategoryName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);

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
        if (selectedCategory) {
            sendRequest(`/api/Categories/EditCategory`, 'PUT', { categoryName }, { categoryId: selectedCategory.categoryId })
                .then(response => {
                    console.log('Категория успешно обновлена:', response);

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
        }
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
        </div>
    );
};

CategoryModalContentEdit.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default CategoryModalContentEdit;
