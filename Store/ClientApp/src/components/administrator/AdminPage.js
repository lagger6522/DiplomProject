import React, { useState } from 'react';
import './AdminPage.css';
import Modal from './Modal';
import CommentsModalContent from './CommentsModalContent';
import UsersListPage from './UsersListPage';
import CloseModal from './CloseModal';

const AdminPage = () => {
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
        setMode(null)

    };

    const renderAdminButtons = () => {
        switch (mode) {          
            case 'comments':
                return (
                    <>
                        <button onClick={() => openModal(<CommentsModalContent />, 'add')}>Управление комментариями</button>
                    </>
                );
            case 'users':
                return (
                    <>
                        <button onClick={() => openModal(<UsersListPage />, 'add')}>Управление пользователями</button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-menu">
                <h2>Панель администратора</h2>
                <div className="admin-menu-button">
                    {!mode && <button onClick={() => openModal(<CloseModal />, 'comments')}>Комментарии</button>}
                    {!mode && <button onClick={() => openModal(<CloseModal />, 'users')}>Пользователи</button>}
                    {renderAdminButtons()}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} modalContent={modalContent} />
        </div>
    );
};

export default AdminPage;
