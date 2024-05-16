import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoryList.css';

const CategoryList = ({ categories, subcategories }) => {
    const [openCategory, setOpenCategory] = useState(null);
    const navigate = useNavigate();

    const handleCategoryClick = (categoryId) => {
        if (openCategory === categoryId) {
            setOpenCategory(null);
        } else {
            setOpenCategory(categoryId);
        }
    };

    const handleSubcategoryClick = (subcategory) => {
        navigate('/components/ProductPage', { state: { subcategory } });
    };

    return (
        <div className="category-list">
            <ul>
                {categories.map((category) => (
                    <li key={category.categoryId}>
                        <div onClick={() => handleCategoryClick(category.categoryId)}>
                            {category.categoryName}
                        </div>
                        {openCategory === category.categoryId && (
                            <ul>
                                {subcategories
                                    .filter((subcategory) => subcategory.parentCategoryId === category.categoryId)
                                    .map((subcategory) => (
                                        <li key={subcategory.subcategoryId} onClick={() => handleSubcategoryClick(subcategory)}>
                                            {subcategory.subcategoryName}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryList;
