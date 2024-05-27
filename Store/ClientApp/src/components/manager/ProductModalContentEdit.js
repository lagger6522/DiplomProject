import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ProductModalContentEdit.css';

const ProductModalContentEdit = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [price, setPrice] = useState('');
    const [attributes, setAttributes] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [newAttributeName, setNewAttributeName] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const subcategoriesResponse = await sendRequest('/api/Subcategories/GetSubcategories', 'GET');
                setSubcategories(subcategoriesResponse);

                const attributesResponse = await sendRequest('/api/Products/GetAttributes', 'GET');
                setAttributes(attributesResponse);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, []);

    const handleSubcategoryChange = async (selectedSubcategoryId) => {
        setSelectedSubcategoryId(selectedSubcategoryId);

        try {
            const response = await sendRequest(`/api/Products/GetProductsBySubcategory?subcategoryId=${selectedSubcategoryId}`, 'GET');
            setProducts(response);
            setSelectedProductId('');
        } catch (error) {
            console.error('Ошибка при загрузке товаров по подкатегории:', error);
        }
    };

    const handleProductChange = async (selectedProductId) => {
        setSelectedProductId(selectedProductId);

        try {
            const response = await sendRequest(`/api/Products/GetProductDetails?productId=${selectedProductId}`, 'GET');
            setProductName(response.productName || '');
            setDescription(response.description || '');
            setImage(response.image || '');
            setPrice(response.price || '');
            setSelectedAttributes(response.attributes.reduce((acc, attribute) => {
                acc[attribute.attributeId] = attribute.value;
                return acc;
            }, {}));
        } catch (error) {
            console.error('Ошибка при загрузке деталей товара:', error);
        }
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            const imageURL = URL.createObjectURL(selectedImage);
            setImage(imageURL);
            setSelectedImage(selectedImage);
            return () => URL.revokeObjectURL(imageURL);
        }
    };

    const handleAttributeChange = (attributeId, value) => {
        setSelectedAttributes({
            ...selectedAttributes,
            [attributeId]: value
        });
    };

    const handleCreateAttribute = () => {
        if (newAttributeName.trim()) {
            sendRequest('/api/Products/CreateAttribute', 'POST', { attributeName: newAttributeName })
                .then(response => {
                    setAttributes([...attributes, response]);
                    setNewAttributeName('');
                })
                .catch(error => {
                    if (error.response && error.response.status === 409) {
                        setNotification({ show: true, message: error.response.data, type: 'error' });
                    } else {
                        setNotification({ show: true, message: 'Ошибка при создании атрибута: ' + error.message, type: 'error' });
                    }
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                });
        }
    };

    const validateForm = () => {
        if (!productName.trim()) {
            setNotification({ show: true, message: 'Название товара не может быть пустым!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return false;
        }
        if (!description.trim()) {
            setNotification({ show: true, message: 'Описание не может быть пустым!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return false;
        }
        if (!price.trim() || isNaN(price)) {
            setNotification({ show: true, message: 'Цена должна быть числовым значением!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return false;
        }
        if (!selectedSubcategoryId) {
            setNotification({ show: true, message: 'Подкатегория должна быть выбрана!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return false;
        }
        if (!Object.values(selectedAttributes).some(value => value.trim())) {
            setNotification({ show: true, message: 'Необходимо ввести хотя бы один атрибут!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return false;
        }
        if (!image) {
            setNotification({ show: true, message: 'Изображение должно быть выбрано!', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        let form = new FormData();
        form.append("productName", productName);
        form.append("description", description);
        if (selectedImage) {
            form.append("image", selectedImage);
        }
        form.append("price", price);
        form.append("subcategoryId", selectedSubcategoryId);

        Object.keys(selectedAttributes).forEach(attributeId => {
            if (selectedAttributes[attributeId]) {
                form.append(`attributes[${attributeId}]`, selectedAttributes[attributeId]);
            }
        });

        try {
            const response = await sendRequest(`/api/Products/EditProduct?productId=${selectedProductId}`, 'PUT', form);
            console.log('Товар успешно обновлен:', response);

            const updatedProducts = await sendRequest(`/api/Products/GetProductsBySubcategory?subcategoryId=${selectedSubcategoryId}`, 'GET');
            setProducts(updatedProducts);

            setNotification({ show: true, message: 'Товар успешно обновлен!', type: 'success' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } catch (error) {
            setNotification({ show: true, message: 'Ошибка при обновлении товара: ' + error.message, type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            console.error('Ошибка при обновлении товара:', error);
        }
    };

    return (
        <div className="product-modal-content">
            <h3>Редактировать товар</h3>
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

            {selectedSubcategoryId && (
                <div>
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
            )}

            {selectedProductId && (
                <div>
                    <div className="form-group">
                        <label htmlFor="productName">Название товара:</label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Описание:</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="image">Изображение:</label>
                        <input
                            type="file"
                            id="image"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="form-control-file"
                        />
                        {image && (
                            <div className="image-preview">
                                <p>Выбранное изображение:</p>
                                <img src={image} alt="Selected" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="price">Цена:</label>
                        <input
                            type="text"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`form-control ${(!price || isNaN(parseFloat(price))) ? 'is-invalid' : ''}`}
                        />
                    </div>

                    <div className="form-group">
                        <label>Характеристики:</label>
                        {attributes.map(attribute => (
                            <div key={attribute.attributeId} className="attribute-group">
                                <label htmlFor={`attribute-${attribute.attributeId}`}>{attribute.attributeName}:</label>
                                <input
                                    type="text"
                                    id={`attribute-${attribute.attributeId}`}
                                    value={selectedAttributes[attribute.attributeId] || ''}
                                    onChange={(e) => handleAttributeChange(attribute.attributeId, e.target.value)}
                                    className="form-control"
                                />
                            </div>
                        ))}
                        <div className="form-group">
                            <label htmlFor="newAttributeName">Новый атрибут:</label>
                            <input
                                type="text"
                                id="newAttributeName"
                                value={newAttributeName}
                                onChange={(e) => setNewAttributeName(e.target.value)}
                                className="form-control"
                            />
                            <button onClick={handleCreateAttribute} className="btn btn-secondary">Создать атрибут</button>
                        </div>
                    </div>
                    <button type="button" onClick={handleSave} className="btn btn-success">
                        Сохранить
                    </button>
                    {notification.show && (
                        <div className={`notification ${notification.type}`}>
                            {notification.message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductModalContentEdit;
