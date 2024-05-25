import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import sendRequest from './SendRequest';
import ProductItem from './ProductItem';
import './ProductPage.css';

const ProductPage = () => {
    const location = useLocation();
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [error, setError] = useState('');
    const [sortOption, setSortOption] = useState('price');
    const [sortDirection, setSortDirection] = useState('desc');
    const [attributes, setAttributes] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        if (location.state && location.state.subcategory) {
            const subcategory = location.state.subcategory;
            setSelectedSubcategory(subcategory);

            Promise.all([
                sendRequest(`/api/Products/GetProductsBySubcategory`, 'GET', null, { subcategoryId: subcategory.subcategoryId }),
                sendRequest(`/api/Products/GetAttributesForSubcategory`, 'GET', null, { subcategoryId: subcategory.subcategoryId })
            ]).then(([productsResponse, attributesResponse]) => {
                setProducts(productsResponse);
                initializeQuantities(productsResponse);
                setAttributes(attributesResponse);
            }).catch(error => {
                console.error('Ошибка при загрузке товаров и атрибутов:', error);
            });
        }
    }, [location.state]);

    useEffect(() => {
        applyFilters();
    }, [selectedAttributes, sortOption, sortDirection, products]);

    const initializeQuantities = (products) => {
        const initialQuantities = {};
        products.forEach(product => {
            initialQuantities[product.productId] = 1;
        });
        setQuantities(initialQuantities);
    };

    const applySorting = (results) => {
        let sortedResults = [...results];

        switch (sortOption) {
            case 'price':
                sortedResults.sort((a, b) => a.price - b.price);
                break;
            case 'rating':
                sortedResults.sort((a, b) => b.averageRating - a.averageRating);
                break;
            default:
                break;
        }

        if (sortDirection === 'asc') {
            sortedResults.reverse();
        }

        return sortedResults;
    };

    const applyFilters = () => {
        let filteredProducts = [...products];

        filteredProducts = filteredProducts.filter(product => {
            return Object.entries(selectedAttributes).every(([attributeId, selectedValue]) => {
                const matchingAttribute = product.productAttributes.find(attr => attr.attributeId === parseInt(attributeId) && (attr.value === selectedValue || selectedValue === ""));
                return matchingAttribute !== undefined;
            });
        });

        filteredProducts = applySorting(filteredProducts);
        setFilteredProducts(filteredProducts);
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

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const handleDirectionChange = (e) => {
        setSortDirection(e.target.value);
    };

    const handleAttributeChange = (attributeId, value) => {
        setSelectedAttributes(prevState => ({
            ...prevState,
            [attributeId]: value
        }));
    };

    return (
        <div className="product-page">
            {error && <div className="error-message">{error}</div>}
            <h2>{selectedSubcategory ? `${selectedSubcategory.subcategoryName}` : 'Выберите подкатегорию'}</h2>
            <div>
                <label>Сортировка по:</label>
                <select value={sortOption} onChange={handleSortChange}>
                    <option value="price">Цене</option>
                    <option value="rating">Рейтингу</option>
                </select>
                <label>Направление:</label>
                <select value={sortDirection} onChange={handleDirectionChange}>
                    <option value="asc">По возрастанию</option>
                    <option value="desc">По убыванию</option>
                </select>
            </div>
            <div>
                <div className="filter-row">
                    {attributes.map(attribute => (
                        <div key={attribute.attributeId} className="filter-item">
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
            </div>
            <div className="product-list">
                {filteredProducts.map((product) => (
                    <ProductItem
                        key={product.productId}
                        product={product}
                        quantity={quantities[product.productId]}
                        onQuantityChange={handleQuantityChange}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductPage;
