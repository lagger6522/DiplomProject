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
    const [price, setPrice] = useState('');

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

        const selectedProduct = products.find(product => product.productId === parseInt(selectedProductId, 10));
        if (selectedProduct) {
            setProductName(selectedProduct.productName || '');
            setDescription(selectedProduct.description || '');
            setImage(selectedProduct.image || '');
            setPrice(selectedProduct.price || '');
        }
    };

    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];

        if (selectedImage) {
            const imageURL = URL.createObjectURL(selectedImage);
            setImage(imageURL);
        }
    };

    const handleSave = () => {
        if (!selectedSubcategoryId || !selectedProductId) {
            console.error('Не выбрана подкатегория или товар.');
            return;
        }

        sendRequest(`/api/Products/EditProduct`, 'PUT', {
            productName,
            description,
            image,
            price,
        },
            { productId: selectedProductId })
            .then(response => {
                console.log('Товар успешно обновлен:', response);
                sendRequest(`/api/Products/GetProductsBySubcategory`, 'GET', null, { subcategoryId: selectedSubcategoryId })
                    .then(response => {
                        setProducts(response);
                    })
                    .catch(error => {
                        console.error('Ошибка при загрузке товаров по подкатегории:', error);
                    });

            })
            .catch(error => {
                console.error('Ошибка при обновлении товара:', error);
            });
    };

    return (
        <div className="product-modal-content">
            <h3>Редактировать товар</h3>
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

            {selectedSubcategoryId && (
                <div>
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
                </div>
            )}

            {selectedProductId && (
                <div>
                    <label htmlFor="productName">Название товара:</label>
                    <input
                        type="text"
                        id="productName"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />
                    <label htmlFor="description">Описание:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <label htmlFor="image">Изображение:</label>
                    <input
                        type="file"
                        id="image"
                        onChange={handleImageChange}
                        accept="image/*"
                    />
                    {image && (
                        <div>
                            <p>Выбранное изображение:</p>
                            <img src={image} alt="Selected" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                        </div>
                    )}
                    <label htmlFor="price">Цена:</label>
                    <input
                        type="text"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
            )}

            <button onClick={handleSave}>Сохранить</button>
        </div>
    );
};

export default ProductModalContentEdit;
