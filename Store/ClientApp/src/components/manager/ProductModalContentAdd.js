import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ProductModalContentAdd.css';

const ProductModalContentAdd = () => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [selectedImage, setFile] = useState('');
    const [price, setPrice] = useState('');
    const [subcategories, setSubcategories] = useState([]);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
    const [attributes, setAttributes] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [newAttributeName, setNewAttributeName] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        sendRequest('/api/Subcategories/GetSubcategories', 'GET')
            .then(response => {
                setSubcategories(response);
            })
            .catch(error => {
                setNotification({ show: true, message: 'Ошибка при загрузке подкатегорий: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });

        sendRequest('/api/Products/GetAttributes', 'GET')
            .then(response => {
                setAttributes(response);
            })
            .catch(error => {
                setNotification({ show: true, message: 'Ошибка при загрузке характеристик: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    }, []);

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage) {
            const imageURL = URL.createObjectURL(selectedImage);
            setImage(imageURL);
            setFile(selectedImage);
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
        if (!selectedImage) {
            setNotification({ show: true, message: 'Изображение не может быть пустым!', type: 'error' });
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
        return true;
    };

    const uploadImage = () => {
        if (!validateForm()) {
            return;
        }

        if (selectedImage) {
            let form = new FormData();
            form.append("productName", productName);
            form.append("description", description);
            form.append("image", selectedImage);
            form.append("price", price);
            form.append("subcategoryId", selectedSubcategoryId);

            Object.keys(selectedAttributes).forEach(attributeId => {
                if (selectedAttributes[attributeId]) {
                    form.append(`attributes[${attributeId}]`, selectedAttributes[attributeId]);
                }
            });

            sendRequest("/api/Products/CreateProduct", "POST", form, null)
                .then(response => {
                    console.log('Товар успешно создан:', response);
                    setNotification({ show: true, message: 'Товар успешно создан!', type: 'success' });
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                })
                .catch(error => {
                    setNotification({ show: true, message: 'Ошибка при создании товара: ' + error.message, type: 'error' });
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                    console.log('Ошибка при создании товара:', error);
                });
        }
    };

    return (
        <div className="product-modal-content">
            <div className="form-group">
                <h3>Добавить товар</h3>
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
                <div className="image-preview">
                    {image && <img src={image} alt="Preview" />}
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="price">Цена:</label>
                <input
                    type="text"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label htmlFor="subcategory">Подкатегория:</label>
                <select
                    id="subcategory"
                    value={selectedSubcategoryId}
                    onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                    className="form-control"
                >
                    <option value="">Выберите подкатегорию</option>
                    {subcategories.map(subcategory => (
                        <option key={subcategory.subcategoryId} value={subcategory.subcategoryId}>{subcategory.subcategoryName}</option>
                    ))}
                </select>
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
            <div className="form-group">
                <button onClick={uploadImage} className="btn btn-primary">Добавить товар</button>
            </div>
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default ProductModalContentAdd;
