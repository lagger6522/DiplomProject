import React, { useState, useEffect, useRef } from 'react';
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
    const [lastSelectedAttribute, setLastSelectedAttribute] = useState(null);

    const notificationRef = useRef(null);

    useEffect(() => {
        sendRequest('/api/Subcategories/GetSubcategories', 'GET')
            .then(response => {
                setSubcategories(response);
            })
            .catch(error => {
                showErrorNotification('Ошибка при загрузке подкатегорий: ' + error.message);
            });

        sendRequest('/api/Products/GetAttributes', 'GET')
            .then(response => {
                setAttributes(response);
            })
            .catch(error => {
                showErrorNotification('Ошибка при загрузке характеристик: ' + error.message);
            });
    }, []);

    const showErrorNotification = (message) => {
        setNotification({ show: true, message, type: 'error' });
        setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        setTimeout(() => notificationRef.current.scrollIntoView({ behavior: 'smooth' }), 100);
    };

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
                        showErrorNotification(error.response.data);
                    } else {
                        showErrorNotification('Ошибка при создании атрибута: ' + error.message);
                    }
                });
        }
    };

    const handleSelectAttribute = (e) => {
        const attributeId = e.target.value;

        if (lastSelectedAttribute && selectedAttributes[lastSelectedAttribute] !== undefined && !selectedAttributes[lastSelectedAttribute].trim()) {
            const updatedSelectedAttributes = { ...selectedAttributes };
            delete updatedSelectedAttributes[lastSelectedAttribute];
            setSelectedAttributes(updatedSelectedAttributes);
        }

        if (attributeId && !selectedAttributes[attributeId]) {
            setSelectedAttributes({ ...selectedAttributes, [attributeId]: '' });
            setLastSelectedAttribute(attributeId);
        } else {
            setLastSelectedAttribute(null);
        }
    };


    const validateForm = () => {
        if (!productName.trim()) {
            showErrorNotification('Название товара не может быть пустым!');
            return false;
        }
        if (!description.trim()) {
            showErrorNotification('Описание не может быть пустым!');
            return false;
        }
        if (!selectedImage) {
            showErrorNotification('Необходимо изображение!');
            return false;
        }
        if (!price.trim() || isNaN(price)) {
            showErrorNotification('Цена введена не корректно!');
            return false;
        }
        if (!selectedSubcategoryId) {
            showErrorNotification('Подкатегория должна быть выбрана!');
            return false;
        }
        if (!Object.values(selectedAttributes).some(value => value.trim())) {
            showErrorNotification('Необходимо ввести хотя бы один атрибут!');
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
            form.append("subcategoryId", selectedSubcategoryId);

            Object.keys(selectedAttributes).forEach(attributeId => {
                if (selectedAttributes[attributeId]) {
                    form.append(`attributes[${attributeId}]`, selectedAttributes[attributeId]);
                }
            });

            sendRequest("/api/Products/CreateProduct", "POST", form, { price })
                .then(response => {
                    console.log('Товар успешно создан:', response);
                    setNotification({ show: true, message: 'Товар успешно создан!', type: 'success' });
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                })
                .catch(error => {
                    showErrorNotification('Ошибка при создании товара: ' + error.message);
                    console.log('Ошибка при создании товара:', error);
                });
        }
    };

    // Create a mapping object for attributes
    const attributeMapping = {};
    attributes.forEach(attribute => {
        attributeMapping[attribute.attributeId] = attribute.attributeName;
    });

    return (
        <div className="product-modal-content">
            <div className="form-group">
                <h3>Добавить товар</h3>
                {notification.show && (
                    <div ref={notificationRef} className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}
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
                    type="number"
                    step="0.01"
                    min="0"
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
                <label htmlFor="attributes">Добавить характеристику:</label>
                <select id="attributes" onChange={handleSelectAttribute} className="form-control">
                    <option value="">Выберите характеристику</option>
                    {attributes.map(attribute => (
                        <option key={attribute.attributeId} value={attribute.attributeId}>
                            {attribute.attributeName}
                        </option>
                    ))}
                </select>
                {lastSelectedAttribute && (
                    <div className="attribute-group">
                        <label htmlFor={`attribute-${lastSelectedAttribute}`}>{attributeMapping[lastSelectedAttribute]}:</label>
                        <input
                            type="text"
                            id={`attribute-${lastSelectedAttribute}`}
                            value={selectedAttributes[lastSelectedAttribute]}
                            onChange={(e) => handleAttributeChange(lastSelectedAttribute, e.target.value)}
                            className="form-control"
                        />
                    </div>
                )}
                {Object.keys(selectedAttributes).filter(attributeId => attributeId !== lastSelectedAttribute && selectedAttributes[attributeId].trim()).map(attributeId => (
                    <div key={attributeId} className="attribute-group">
                        <label htmlFor={`attribute-${attributeId}`}>{attributeMapping[attributeId]}:</label>
                        <input
                            type="text"
                            id={`attribute-${attributeId}`}
                            value={selectedAttributes[attributeId]}
                            onChange={(e) => handleAttributeChange(attributeId, e.target.value)}
                            className="form-control"
                        />
                    </div>
                ))}
            </div>
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
            <div className="form-group">
                <button onClick={uploadImage} className="btn btn-primary">Добавить товар</button>
            </div>
        </div>
    );
};

export default ProductModalContentAdd;
