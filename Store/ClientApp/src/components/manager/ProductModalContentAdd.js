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

    useEffect(() => {
        sendRequest('/api/Subcategories/GetSubcategories', 'GET')
            .then(response => {
                setSubcategories(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке подкатегорий:', error);
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
    const uploadImage = () => {
        if (selectedImage) {
            let form = new FormData();
            form.append("productName", productName);
            form.append("description", description);
            form.append("image", selectedImage);
            form.append("price", price);
            form.append("subcategoryId", selectedSubcategoryId);
            sendRequest("/api/Products/CreateProduct", "POST", form, null)
                .then(response => {
                    console.log('Товар успешно создан:', response);
                })
                .catch(e => console.log(e));
        }
    }

    return (
        <div className="product-modal-content">
            <h3>Добавить товар</h3>
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
            <label htmlFor="subcategory">Подкатегория:</label>
            <select
                id="subcategory"
                value={selectedSubcategoryId}
                onChange={(e) => setSelectedSubcategoryId(e.target.value)}
            >
                <option value="">Выберите подкатегорию</option>
                {subcategories.map(subcategory => (
                    <option key={subcategory.subcategoryId} value={subcategory.subcategoryId}>
                        {subcategory.subcategoryName}
                    </option>
                ))}
            </select>
            <button onClick={uploadImage}>Сохранить</button>
        </div>
    );
};

export default ProductModalContentAdd;
