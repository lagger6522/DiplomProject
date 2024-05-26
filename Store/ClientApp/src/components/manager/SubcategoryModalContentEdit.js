import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import sendRequest from '../SendRequest';
import './style.css';

const SubcategoryModalContentEdit = ({ onClose }) => {
    const [subcategoryName, setSubcategoryName] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        sendRequest('/api/Subcategories/GetSubcategories', 'GET', null, null)
            .then(response => {
                setSubcategories(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке подкатегорий:', error);
            });
    }, []);

    const handleSubcategoryChange = (selectedSubcategoryId) => {
        const subcategory = subcategories.find(subcategory => subcategory.subcategoryId === parseInt(selectedSubcategoryId, 10));
        setSelectedSubcategory(subcategory);
        setSubcategoryName(subcategory ? subcategory.subcategoryName : '');
    };

    const handleSave = () => {
        if (!selectedSubcategory) {
            setNotification({ show: true, message: 'Выберите подкатегорию!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        if (subcategoryName.trim() === '') {
            setNotification({ show: true, message: 'Название подкатегории не может быть пустым!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        const duplicateSubcategory = subcategories.find(
            (subcategory) => subcategory.subcategoryName === subcategoryName &&
                subcategory.parentCategoryId === selectedSubcategory.parentCategoryId &&
                subcategory.subcategoryId !== selectedSubcategory.subcategoryId &&
                !subcategory.isDeleted
        );

        if (duplicateSubcategory) {
            setNotification({ show: true, message: 'Подкатегория с таким названием уже существует для данной категории!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        sendRequest(`/api/Subcategories/EditSubcategory`, 'PUT', { subcategoryName }, { subcategoryId: selectedSubcategory.subcategoryId })
            .then(response => {
                console.log('Подкатегория успешно обновлена:', response);
                setNotification({ show: true, message: 'Подкатегория успешно обновлена!', type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);

                sendRequest('/api/Subcategories/GetSubcategories', 'GET', null, null)
                    .then(updatedSubcategories => {
                        setSubcategories(updatedSubcategories);
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке подкатегорий после обновления:', error);
                    });
            })
            .catch(error => {
                console.error('Ошибка при обновлении подкатегории:', error);
                const errorMessage = error?.response?.data?.message || 'Ошибка при обновлении подкатегории.';
                setNotification({ show: true, message: errorMessage, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    };

    return (
        <div className="align-column">
            <h3>Редактировать подкатегорию</h3>
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
            <label htmlFor="subcategoryName">Новое название подкатегории:</label>
            <input
                type="text"
                id="subcategoryName"
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
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

SubcategoryModalContentEdit.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default SubcategoryModalContentEdit;
