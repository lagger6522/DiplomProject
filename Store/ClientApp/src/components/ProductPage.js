import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import sendRequest from './SendRequest';
import './ProductPage.css';

const ProductPage = () => {
    const location = useLocation();
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [error, setError] = useState('');
    const [attributes, setAttributes] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (location.state && location.state.subcategory) {
            const subcategory = location.state.subcategory;
            setSelectedSubcategory(subcategory);

            sendRequest(`/api/Products/GetProductsBySubcategory`, 'GET', null, { subcategoryId: subcategory.subcategoryId })
                .then(response => {
                    setProducts(response);
                    setFilteredProducts(response);
                    initializeQuantities(response);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке товаров по подкатегории:', error);
                });

            sendRequest(`/api/Products/GetAttributesForSubcategory`, 'GET', null, { subcategoryId: subcategory.subcategoryId })
                .then(response => {
                    setAttributes(response);
                })
                .catch(error => {
                    console.error('Ошибка при загрузке атрибутов для подкатегории:', error);
                });
        }
    }, [location.state]);

    useEffect(() => {
        applyFilters();
    }, [selectedAttributes]);

    const initializeQuantities = (products) => {
        const initialQuantities = {};
        products.forEach(product => {
            initialQuantities[product.productId] = 1;
        });
        setQuantities(initialQuantities);
    };

    const handleQuantityChange = (productId, amount) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: Math.max(prevQuantities[productId] + amount, 1),
        }));
    };

    const handleAddToCart = (productId) => {
        const quantity = quantities[productId];
        var userId = sessionStorage.getItem("userId");

        if (!userId) {
            setError('Для добавления товара в корзину необходимо войти в систему.');
            return;
        }
        sendRequest('/api/Cart/AddToCart', 'POST', {
            productId,
            userId,
            quantity,
        })
            .then(response => {
                console.log('Товар успешно добавлен в корзину:', response);
            })
            .catch(error => {
                console.error('Ошибка при добавлении товара в корзину:', error);
            });
    };

    const handleAttributeChange = (attributeId, value) => {
        setSelectedAttributes(prevState => ({
            ...prevState,
            [attributeId]: value
        }));
    };

    const applyFilters = () => {
        console.log("Selected attributes:", selectedAttributes);

        if (Object.keys(selectedAttributes).length === 0) {
            setFilteredProducts(products);
        } else {
            const filteredProducts = products.filter(product => {
                return Object.entries(selectedAttributes).every(([attributeId, selectedValue]) => {
                    const matchingAttribute = product.productAttributes.find(attr => attr.attributeId === parseInt(attributeId) && (attr.value === selectedValue || selectedValue === ""));
                    return matchingAttribute !== undefined;
                });
            });
            setFilteredProducts(filteredProducts);
        }
    };

    return (
        <div className="product-page">
            {error && <div className="error-message">{error}</div>}
            <h2>{selectedSubcategory ? `${selectedSubcategory.subcategoryName}` : 'Выберите подкатегорию'}</h2>
            <div>
                <h3>Фильтрация по атрибутам:</h3>
                {attributes.map(attribute => (
                    <div key={attribute.attributeId}>
                        <label>{attribute.attributeName}:</label>
                        <select onChange={(e) => handleAttributeChange(attribute.attributeId, e.target.value)}>
                            <option value="">Все</option>
                            {attribute.values.map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
            <div className="product-list">
                {filteredProducts.map((product) => (
                    <div key={product.productId} className="product-item">
                        <Link className="no-line" to={`/product-details/${product.productId}`}>
                            <img src={product.image} className="product-image" alt={product.productName} />
                        </Link>
                        <div className="product-details">
                            <Link className="no-line" to={`/product-details/${product.productId}`}>
                                <h5>{product.productName}</h5>
                            </Link>
                            <div>
                                <span>Оценка: {product.averageRating !== undefined ? product.averageRating.toFixed(2) : 'Нет оценки'}</span>
                                <span>({product.reviewCount !== undefined ? product.reviewCount : 0} отзыва(ов))</span>
                            </div>
                            <div className="cost">Цена: {product.price} руб.</div>
                            <div className="cart-controls">
                                <button className="counter-button" onClick={() => handleQuantityChange(product.productId, -1)}>-</button>
                                <input type="number" value={quantities[product.productId]} readOnly />
                                <button className="counter-button" onClick={() => handleQuantityChange(product.productId, 1)}>+</button>
                                <button className="cart-button" onClick={() => handleAddToCart(product.productId)}>В корзину</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductPage;
