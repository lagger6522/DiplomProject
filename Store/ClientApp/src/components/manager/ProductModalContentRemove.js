import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ProductModalContentAdd.css';

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
                setNotification({ show: true, message: 'Товар успешно удален!', type: 'success' });
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
                console.error('Ошибка при удалении товара:', error);
                setNotification({ show: true, message: 'Ошибка при удалении товара!', type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });

        setShowConfirmation(false);
    };

    const handleCancelRemove = () => {
        setShowConfirmation(false);
    };

    return (
        <div className="product-modal-content">
            <h3>Удалить товар</h3>            
            <div className="form-group">
                <label htmlFor="subcategory">Выберите подкатегорию:</label>
                <select
                    id="subcategory"
                    value={selectedSubcategoryId}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    className="form-control"
                >
                    <option value="">Выберите подкатегорию</option>
                    {subcategories.map(subcategory => (
                        <option key={subcategory.subcategoryId} value={subcategory.subcategoryId}>
                            {subcategory.subcategoryName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="product">Выберите товар:</label>
                <select
                    id="product"
                    value={selectedProductId}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="form-control"
                >
                    <option value="">Выберите товар</option>
                    {products.map(product => (
                        <option key={product.productId} value={product.productId}>
                            {product.productName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <button onClick={handleRemove} className="btn btn-primary">Удалить</button>
            </div>

            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {showConfirmation && (
                <div className="confirmation-modal">
                    <p>Вы уверены, что хотите удалить товар?</p>
                    <button onClick={handleConfirmRemove} className="btn btn-primary">Да</button>
                    <button onClick={handleCancelRemove} className="btn btn-secondary">Отмена</button>
                </div>
            )}
        </div>
    );
};

export default ProductModalContentRemove;
