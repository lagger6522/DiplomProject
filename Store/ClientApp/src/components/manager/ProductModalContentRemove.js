import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ProductModalContentRemove.css';

const ProductModalContentRemove = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        sendRequest('/api/Subcategories/GetSubcategories', 'GET')
            .then(response => {
                setSubcategories(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке подкатегорий:', error);
            });
    }, []);

    const handleSubcategoryChange = (selectedSubcategoryId) => {
        setSelectedSubcategoryId(selectedSubcategoryId);

        sendRequest(`/api/Products/GetProductsBySubcategory`, 'GET', null, { subcategoryId: selectedSubcategoryId })
            .then(response => {
                setProducts(response);
                setSelectedProductId('');
            })
            .catch(error => {
                console.error('Ошибка при загрузке товаров по подкатегории:', error);
            });
    };

    const handleProductChange = (selectedProductId) => {
        setSelectedProductId(selectedProductId);
    };

    const validateForm = () => {
        if (!selectedSubcategoryId.trim()) {
            setNotification({ show: true, message: 'Подкатегория не может быть пустой!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return false;
        }
        if (!selectedProductId.trim()) {
            setNotification({ show: true, message: 'Товар не может быть пустым!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return false;
        }
        return true;
    };

    const handleRemove = () => {
        if (!validateForm()) {
            return;
        }
        setShowConfirmation(true);
    };

    const handleConfirmRemove = () => {
        sendRequest(`/api/Products/HideProduct`, 'POST', null, { productId: selectedProductId })
            .then(response => {
                console.log('Товар успешно скрыт:', response);
                setNotification({ show: true, message: 'Товар успешно скрыт!', type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);

                sendRequest(`/api/Products/GetProductsBySubcategory`, 'GET', null, { subcategoryId: selectedSubcategoryId })
                    .then(response => {
                        setProducts(response);
                        setSelectedProductId('');
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке товаров по подкатегории:', error);
                    });
            })
            .catch(error => {
                console.error('Ошибка при скрытии товара:', error);
                setNotification({ show: true, message: 'Ошибка при скрытии товара!', type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });

        setShowConfirmation(false);
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="product-modal-content-remove">
            <h3>Удалить товар</h3>

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <label htmlFor="subcategory">Выберите подкатегорию:</label>
            <select
                id="subcategory"
                value={selectedSubcategoryId}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className={`form-control ${!selectedSubcategoryId ? 'is-invalid' : ''}`}
            >
                <option value="">Выберите подкатегорию</option>
                {subcategories.map(subcategory => (
                    <option key={subcategory.subcategoryId} value={subcategory.subcategoryId}>
                        {subcategory.subcategoryName}
                    </option>
                ))}
            </select>

            <label htmlFor="product">Выберите товар:</label>
            <select
                id="product"
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className={`form-control ${!selectedProductId ? 'is-invalid' : ''}`}
            >
                <option value="">Выберите товар</option>
                {products.map(product => (
                    <option key={product.productId} value={product.productId}>
                        {product.productName}
                    </option>
                ))}
            </select>

            <button onClick={handleRemove}>Удалить</button>
            {showConfirmation && (
                <div className="confirmation-modal">
                    <p>Вы уверены, что хотите удалить товар?</p>
                    <button onClick={handleConfirmRemove}>Да</button>
                    <button onClick={handleCancelRemove}>Отмена</button>
                </div>
            )}
        </div>
    );
};

export default ProductModalContentRemove;
