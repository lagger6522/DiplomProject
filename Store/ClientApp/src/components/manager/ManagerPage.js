import React, { useState } from 'react';
import CategoryModalContentAdd from './CategoryModalContentAdd';
import CategoryModalContentRemove from './CategoryModalContentRemove';
import CategoryModalContentEdit from './CategoryModalContentEdit';
import SubcategoryModalContentAdd from './SubcategoryModalContentAdd';
import SubcategoryModalContentEdit from './SubcategoryModalContentEdit';
import SubcategoryModalContentRemove from './SubcategoryModalContentRemove';
import ProductModalContentAdd from './ProductModalContentAdd';
import ProductModalContentEdit from './ProductModalContentEdit';
import ProductModalContentRemove from './ProductModalContentRemove';
import AttributesEditor from './AttributesEditor';
import OrderHistory from './OrderHistory';
import CloseModal from './CloseModal';
import './ManagerPage.css';
import Modal from './Modal';

const ManagerPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [mode, setMode] = useState(null);

    const openModal = (content, selectedMode) => {
        setModalContent(content);
        setIsModalOpen(true);
        setMode(selectedMode);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setMode(null);
    };

    const renderAdminButtons = () => {
        switch (mode) {
            case 'category':
                return (
                    <>
                        <button onClick={() => openModal(<CategoryModalContentAdd />, 'add')}>Добавить</button>
                        <button onClick={() => openModal(<CategoryModalContentEdit />, 'edit')}>Редактировать</button>
                        <button onClick={() => openModal(<CategoryModalContentRemove />, 'delete')}>Удалить</button>
                        <button onClick={closeModal} className="close-button">Закрыть</button>
                    </>
                );
            case 'subcategory':
                return (
                    <>
                        <button onClick={() => openModal(<SubcategoryModalContentAdd />, 'add')}>Добавить</button>
                        <button onClick={() => openModal(<SubcategoryModalContentEdit />, 'edit')}>Редактировать</button>
                        <button onClick={() => openModal(<SubcategoryModalContentRemove />, 'delete')}>Удалить</button>
                        <button onClick={closeModal} className="close-button">Закрыть</button>
                    </>
                );
            case 'products':
                return (
                    <>
                        <button onClick={() => openModal(<ProductModalContentAdd />, 'add')}>Добавить</button>
                        <button onClick={() => openModal(<ProductModalContentEdit />, 'edit')}>Редактировать</button>
                        <button onClick={() => openModal(<ProductModalContentRemove />, 'delete')}>Удалить</button>
                        <button onClick={closeModal} className="close-button">Закрыть</button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-menu">
                <h2>Панель менеджера</h2>
                <div className="admin-menu-button">
                    {!mode && <button onClick={() => setMode('category')}>Категории</button>}
                    {!mode && <button onClick={() => setMode('subcategory')}>Подкатегории</button>}
                    {!mode && <button onClick={() => setMode('products')}>Товары</button>}
                    {!mode && <button onClick={() => openModal(<OrderHistory />, 'orders')}>Заказы</button>}
                    {!mode && <button onClick={() => openModal(<AttributesEditor />, 'attribytes')}>Характеристики</button>}
                    {mode && renderAdminButtons()}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} modalContent={modalContent} />
        </div>
    );
};

export default ManagerPage;
