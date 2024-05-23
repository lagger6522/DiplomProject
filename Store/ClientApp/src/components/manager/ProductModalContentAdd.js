import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ModalContent.css';

const ProductModalContentAdd = ({ onClose }) => {
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
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        sendRequest('/api/Subcategories/GetSubcategories', 'GET')
            .then(response => {
                setSubcategories(response);
            })
            .catch(error => {
                setErrorMessage('Ошибка при загрузке подкатегорий:' + error.message);
            });

        sendRequest('/api/Products/GetAttributes', 'GET')
            .then(response => {
                setAttributes(response);
            })
            .catch(error => {
                setErrorMessage('Ошибка при загрузке характеристик:' + error.message);
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
                        setErrorMessage(error.response.data);
                    } else {
                        setErrorMessage(error.message);
                    }
                });
        }
    };

    const uploadImage = () => {
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
                })
                .catch(error => {
                    setErrorMessage('Ошибка при загрузке товара:' + error.message);
                });
        }
    };

    return (
        <div className="product-modal-content">
            <h3>Добавить товар</h3>
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
                        <img src={image} alt="Selected" />
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
                        <option key={subcategory.subcategoryId} value={subcategory.subcategoryId}>
                            {subcategory.subcategoryName}
                        </option>
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
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button onClick={uploadImage} className="btn btn-primary">Сохранить</button>
        </div>
    );
};

export default ProductModalContentAdd;
