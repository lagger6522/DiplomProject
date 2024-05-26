import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ModalContent.css';

const ProductModalContentRemove = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');

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

    const handleRemove = () => {
        if (!selectedProductId) {
            console.error('Не выбран товар.');
            return;
        }

        sendRequest(`/api/Products/HideProduct`, 'POST', null, { productId: selectedProductId })
            .then(response => {
                console.log('Товар успешно скрыт:', response);
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

export default ProductModalContentRemove;
