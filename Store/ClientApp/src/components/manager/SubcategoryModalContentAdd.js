import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './SubcategoryModalContent.css';

const SubcategoryModalContentAdd = () => {
    const [subcategoryName, setSubcategoryName] = useState('');
    const [parentCategoryId, setParentCategoryId] = useState(null);
    const [categories, setCategories] = useState([]);

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
            console.error('Не выбрана родительская категория.');
            return;
        }

        sendRequest('/api/Subcategories/CreateSubcategory', 'POST', {
            subcategoryName,
            parentCategoryId,
        })
            .then(response => {
                console.log('Подкатегория успешно создана:', response);
            })
            .catch(error => {
                console.error('Ошибка при создании подкатегории:', error);
            });
    };

    return (
        <div className="select-sub">
            <h3>Добавить подкатегорию</h3>
            <label htmlFor="parentCategory">Родительская категория:</label>
            <select
                id="parentCategory"
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(Number(e.target.value))}
            >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                    </option>
                ))}
            </select>
            <label htmlFor="subcategoryName">Название подкатегории:</label>
            <input
                type="text"
                id="subcategoryName"
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
            />
            
            <button onClick={handleSave}>Сохранить</button>
        </div>
    );
};

export default SubcategoryModalContentAdd;
