import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import sendRequest from '../SendRequest';
import './ModalContent.css';


const ProductModalContentRemove = ({ onClose }) => {
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');

    useEffect(() => {
        // Загрузка списка подкатегорий при монтировании компонента
        sendRequest('/api/Categories/GetSubcategories', 'GET')
            .then(response => {
                setSubcategories(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке подкатегорий:', error);
            });
    }, []);

    const handleSubcategoryChange = (selectedSubcategoryId) => {
        setSelectedSubcategoryId(selectedSubcategoryId);

        // Загрузка товаров выбранной подкатегории
        sendRequest(`/api/Categories/GetProductsBySubcategory`, 'GET', null, { subcategoryId: selectedSubcategoryId })
            .then(response => {
                setProducts(response);
                setSelectedProductId(''); // Сброс выбранного товара
            })
            .catch(error => {
                console.error('Ошибка при загрузке товаров по подкатегории:', error);
            });
    };

    const handleProductChange = (selectedProductId) => {
        // При выборе товара обновляем выбранный товар
        setSelectedProductId(selectedProductId);
    };

    const handleRemove = () => {
        // Проверка, что товар выбран
        if (!selectedProductId) {
            console.error('Не выбран товар.');
            return;
        }

        // Отправка запроса на сервер для удаления товара
        sendRequest(`/api/Categories/RemoveProduct`, 'DELETE', null, { productId: selectedProductId })
            .then(response => {
                // Обработка успешного ответа от сервера
                console.log('Товар успешно удален:', response); 
                sendRequest(`/api/Categories/GetProductsBySubcategory`, 'GET', null, { subcategoryId: selectedSubcategoryId })
                    .then(response => {
                        setProducts(response);
                        setSelectedProductId(''); // Сброс выбранного товара
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке товаров по подкатегории:', error);
                    });
            })
            .catch(error => {
                // Обработка ошибки при удалении товара
                console.error('Ошибка при удалении товара:', error);
            });
    };

    return (
        <div className="product-modal-content-remove">
            <h3>Удалить товар</h3>

            <label htmlFor="subcategory">Выберите подкатегорию:</label>
            <select
                id="subcategory"
                value={selectedSubcategoryId}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
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
            >
                <option value="">Выберите товар</option>
                {products.map(product => (
                    <option key={product.productId} value={product.productId}>
                        {product.productName}
                    </option>
                ))}
            </select>

            <button onClick={handleRemove}>Удалить</button>
        </div>
    );
};

ProductModalContentRemove.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default ProductModalContentRemove;
