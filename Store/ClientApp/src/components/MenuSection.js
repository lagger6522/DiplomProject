import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import sendRequest from './SendRequest';
import './MenuSection.css';

const MenuSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [searchEmpty, setSearchEmpty] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
      sendRequest('/api/Products/GetProducts', 'GET')
      .then((data) => {
        setAllProducts(data);
      })
      .catch((error) => {
        console.error('Ошибка загрузки каталога:', error);
      });
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchEmpty(true);
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
      <div
        className="menu-buttons"
      >        
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

      {searchEmpty && <p>Поисковый запрос пуст. </p>}
    </div>
  );
};

export default MenuSection;
