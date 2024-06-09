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
        setMode(selectedMode);
        setIsModalOpen(true);
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
                    </>
                );
            case 'subcategory':
                return (
                    <>
                        <button onClick={() => openModal(<SubcategoryModalContentAdd />, 'add')}>Добавить</button>
                        <button onClick={() => openModal(<SubcategoryModalContentEdit />, 'edit')}>Редактировать</button>
                        <button onClick={() => openModal(<SubcategoryModalContentRemove />, 'delete')}>Удалить</button>
                    </>
                );   
            case 'products':
                return (
                    <>
                        <button onClick={() => openModal(<ProductModalContentAdd />, 'add')}>Добавить</button>
                        <button onClick={() => openModal(<ProductModalContentEdit />, 'edit')}>Редактировать</button>
                        <button onClick={() => openModal(<ProductModalContentRemove />, 'delete')}>Удалить</button>
                    </>
                );  
            case 'orders':
                return (
                    <>
                        <button onClick={() => openModal(<OrderHistory />, 'add')}>Список заказов</button>
                    </>
                );
            case 'attribytes':
                return (
                    <>
                        <button onClick={() => openModal(<AttributesEditor />, 'add')}>Характеристики</button>
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
                    {!mode && <button onClick={() => openModal(<CloseModal />, 'category')}>Категории</button>}
                    {!mode && <button onClick={() => openModal(<CloseModal />, 'subcategory')}>Подкатегории</button>}
                    {!mode && <button onClick={() => openModal(<CloseModal />, 'products')}>Товары</button>}
                    {!mode && <button onClick={() => openModal(<CloseModal />, 'orders')}>Заказы</button>}
                    {!mode && <button onClick={() => openModal(<CloseModal />, 'attribytes')}>Характеристики</button>}
                    {renderAdminButtons()}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} modalContent={modalContent} />
        </div>
    );
};

export default ManagerPage;
