import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import sendRequest from '../SendRequest';
import './style.css';

const SubcategoryModalContentRemove = ({ onClose }) => {
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        sendRequest('/api/Subcategories/GetSubcategories', 'GET', null, null)
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
        setShowConfirmation(false);
    };

    const handleRemove = () => {
        setShowConfirmation(true);
    };

    const handleConfirmRemove = () => {
        if (selectedSubcategory) {
            sendRequest(`/api/Subcategories/RemoveSubcategory`, 'DELETE', null, { subcategoryId: selectedSubcategory.subcategoryId })
                .then(response => {
                    console.log('Подкатегория и связанные товары успешно удалены:', response);
                    setSubcategories(prevSubcategories => prevSubcategories.filter(subcategory => subcategory.subcategoryId !== selectedSubcategory.subcategoryId));
                    setShowConfirmation(false);
                    setSelectedSubcategory(null);
                    onClose();
                })
                .catch(error => {
                    console.error('Ошибка при удалении подкатегории и связанных товаров:', error);
                    setShowConfirmation(false);
                });
        }
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false);
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
