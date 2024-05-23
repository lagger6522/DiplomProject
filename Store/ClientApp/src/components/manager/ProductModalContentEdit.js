import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './ModalContent.css';

const ProductModalContentEdit = ({ onClose }) => {
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

            // Освобождение памяти при изменении изображения
            return () => URL.revokeObjectURL(imageURL);
        }
    };

    const handleAttributeChange = (attributeId, value) => {
        setSelectedAttributes({
            ...selectedAttributes,
            [attributeId]: value
        });
    };

    const handleCreateAttribute = async () => {
        if (newAttributeName.trim()) {
            try {
                const response = await sendRequest('/api/Products/CreateAttribute', 'POST', { attributeName: newAttributeName });
                setAttributes([...attributes, response]);
                setNewAttributeName('');
            } catch (error) {
                console.error('Ошибка при создании нового атрибута:', error);
            }
        }
    };

    const handleSave = async () => {
        if (!selectedSubcategoryId || !selectedProductId) {
            console.error('Не выбрана подкатегория или товар.');
            return;
        }

        let form = new FormData();
        if (productName) form.append("productName", productName);
        if (description) form.append("description", description);
        if (price) form.append("price", price);
        if (selectedSubcategoryId) form.append("subcategoryId", selectedSubcategoryId);

        if (selectedImage) {
            form.append("image", selectedImage);
        }

        Object.keys(selectedAttributes).forEach(attributeId => {
            const value = selectedAttributes[attributeId];
            if (value !== undefined && value !== null) {
                form.append(`attributes[${attributeId}]`, value);
            }
        });

        try {
            const response = await sendRequest(`/api/Products/EditProduct?productId=${selectedProductId}`, 'PUT', form);
            console.log('Товар успешно обновлен:', response);

            const updatedProducts = await sendRequest(`/api/Products/GetProductsBySubcategory?subcategoryId=${selectedSubcategoryId}`, 'GET');
            setProducts(updatedProducts);
        } catch (error) {
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
                            className="form-control"
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
                        <div className="create-attribute">
                            <input
                                type="text"
                                placeholder="Название новой характеристики"
                                value={newAttributeName}
                                onChange={(e) => setNewAttributeName(e.target.value)}
                                className="form-control"
                            />
                            <button
                                type="button"
                                onClick={handleCreateAttribute}
                                className="btn btn-primary"
                            >
                                Добавить характеристику
                            </button>
                        </div>
                    </div>
                    <button type="button" onClick={handleSave} className="btn btn-success">
                        Сохранить
                    </button>
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        Закрыть
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductModalContentEdit;
