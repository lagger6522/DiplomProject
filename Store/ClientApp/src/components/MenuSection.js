import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sendRequest from './SendRequest';
import './MenuSection.css';

const MenuSection = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [searchEmpty, setSearchEmpty] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const navigate = useNavigate();

    useEffect(() => {
        sendRequest('/api/Products/GetVisibleProducts', 'GET')
            .then((data) => {
                setAllProducts(data);
            })
            .catch((error) => {
                console.error('Ошибка загрузки каталога:', error);
                setNotification({ show: true, message: 'Ошибка загрузки каталога: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    }, []);

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setSearchEmpty(true);
            setNotification({ show: true, message: 'Поисковый запрос пуст.', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        const filteredProducts = allProducts.filter((product) =>
            product.productName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchEmpty(false);

        navigate('/search-results', { state: { searchResults: filteredProducts } });
    };

    return (
        <div className="menu-section">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            <div className="menu-buttons">
                <button>Оплата и доставка</button>
                <button>Контакты</button>
                <button>О нас</button>
            </div>
            <div className="search-menu">
                <input
                    type="text"
                    placeholder="Поиск по каталогу"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>Найти</button>
            </div>

            {searchEmpty}
        </div>
    );
};

export default MenuSection;
