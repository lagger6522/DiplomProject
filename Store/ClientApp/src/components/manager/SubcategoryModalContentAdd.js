import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ProductModalContentAdd.css';

const SubcategoryModalContentAdd = () => {
    const [subcategoryName, setSubcategoryName] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        sendRequest('/api/Categories/GetCategories', 'GET')
            .then(response => {
                setCategories(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке категорий:', error);
            });
    }, []);

    const handleSave = () => {
        if (!parentCategoryId) {
            setNotification({ show: true, message: 'Выберите родительскую категорию!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        if (subcategoryName.trim() === '') {
            setNotification({ show: true, message: 'Название подкатегории не может быть пустым!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        sendRequest('/api/Subcategories/CreateSubcategory', 'POST', {
            subcategoryName,
            parentCategoryId,
        })
            .then(response => {
                console.log('Подкатегория успешно создана:', response);
                setNotification({ show: true, message: 'Подкатегория успешно создана!', type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            })
            .catch(error => {
                const errorMessage = error?.response?.data?.message || 'Такая подкатегория уже существует!';
                setNotification({ show: true, message: errorMessage, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                console.error('Ошибка при создании подкатегории:', error);
            });
    };

    return (
        <div className="product-modal-content">
            <h3>Добавить подкатегорию</h3>
            <div className="form-group">
                <label htmlFor="parentCategory">Родительская категория:</label>
                <select
                    id="parentCategory"
                    value={parentCategoryId}
                    onChange={(e) => setParentCategoryId(Number(e.target.value))}
                    className="form-control"
                >
                    <option value="">Выберите категорию</option>
                    {categories.map(category => (
                        <option key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="subcategoryName">Название подкатегории:</label>
                <input
                    type="text"
                    id="subcategoryName"
                    value={subcategoryName}
                    onChange={(e) => setSubcategoryName(e.target.value)}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <button onClick={handleSave} className="btn btn-primary">Сохранить</button>
            </div>

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default SubcategoryModalContentAdd;
