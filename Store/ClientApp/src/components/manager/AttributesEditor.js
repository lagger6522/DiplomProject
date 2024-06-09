import React, { useState, useEffect, useRef } from 'react';
import sendRequest from '../SendRequest';
import './AttributesEditor.css';

const AttributesEditor = () => {
    const [attributes, setAttributes] = useState([]);
    const [newAttributeName, setNewAttributeName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [editingAttribute, setEditingAttribute] = useState(null);

    const notificationRef = useRef(null);

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const response = await sendRequest('/api/Products/GetAttributes', 'GET');
                setAttributes(response);
            } catch (error) {
                console.error('Ошибка при загрузке атрибутов:', error);
            }
        };

        fetchAttributes();
    }, []);

    useEffect(() => {
        if (notification.show) {
            notificationRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [notification]);

    const handleCreateAttribute = () => {
        if (newAttributeName.trim()) {
            sendRequest('/api/Products/CreateAttribute', 'POST', { attributeName: newAttributeName })
                .then(response => {
                    setAttributes([...attributes, response]);
                    setNewAttributeName('');
                    setNotification({ show: true, message: 'Атрибут успешно создан!', type: 'success' });
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                })
                .catch(error => {
                    if (error.response && error.response.status === 409) {
                        setNotification({ show: true, message: error.response.data, type: 'error' });
                    } else {
                        setNotification({ show: true, message: 'Ошибка при создании атрибута: ' + error.message, type: 'error' });
                    }
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                });
        }
    };

    const handleSaveAttributeName = (attributeId, attributeName) => {
        sendRequest('/api/Products/EditAttribute', 'PUT', { attributeId, attributeName })
            .then(response => {
                const updatedAttributes = attributes.map(attr => {
                    if (attr.attributeId === attributeId) {
                        return { ...attr, attributeName };
                    }
                    return attr;
                });
                setAttributes(updatedAttributes);
                setEditingAttribute(null);
                setNotification({ show: true, message: 'Название атрибута успешно обновлено!', type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            })
            .catch(error => {
                setNotification({ show: true, message: 'Ошибка при обновлении названия атрибута: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                console.error('Ошибка при обновлении названия атрибута:', error);
            });
    };

    const handleDeleteAttribute = async (attributeId) => {
        try {
            await sendRequest(`/api/Products/DeleteAttribute`, 'PUT', null, { attributeId });
            try {
                const response = await sendRequest('/api/Products/GetAttributes', 'GET');
                setAttributes(response);
            } catch (error) {
                console.error('Ошибка при загрузке атрибутов:', error);
            }
        } catch (error) {
            console.error('Ошибка при удалении атрибута:', error);
        }
    };

    const handleRestoreAttribute = async (attributeId) => {
        try {
            await sendRequest(`/api/Products/RestoreAttribute`, 'PUT', null, { attributeId });
            try {
                const response = await sendRequest('/api/Products/GetAttributes', 'GET');
                setAttributes(response);
            } catch (error) {
                console.error('Ошибка при загрузке атрибутов:', error);
            }
        } catch (error) {
            console.error('Ошибка при восстановлении атрибута:', error);
        }
    };

    const handleEditButtonClick = (attributeId) => {
        setEditingAttribute(attributeId);
    };

    const filteredAttributes = attributes.filter(attribute =>
        attribute.attributeName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="attributes-editor">
            <h2>Редактирование характеристик</h2>
            {notification.show && (
                <div ref={notificationRef} className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <div className="form-group">
                <label>Поиск атрибутов:</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск..."
                />
            </div>

            <div className="form-group">
                <label>Добавить атрибут:</label>
                <input
                    type="text"
                    value={newAttributeName}
                    onChange={(e) => setNewAttributeName(e.target.value)}
                    placeholder="Название атрибута"
                />
                <button onClick={handleCreateAttribute}>Добавить</button>
            </div>

            <div className="attributes-list">
                {filteredAttributes.map(attribute => (
                    <div key={attribute.attributeId} className={`attribute-item ${attribute.isDeleted ? 'deleted' : ''}`}>
                        {editingAttribute === attribute.attributeId ? (
                            <>
                                <input
                                    type="text"
                                    value={attribute.attributeName}
                                    onChange={(e) => {
                                        const updatedAttributes = attributes.map(attr => {
                                            if (attr.attributeId === attribute.attributeId) {
                                                return { ...attr, attributeName: e.target.value };
                                            }
                                            return attr;
                                        });
                                        setAttributes(updatedAttributes);
                                    }}
                                    placeholder={attribute.attributeName}
                                />
                                <button onClick={() => handleSaveAttributeName(attribute.attributeId, attribute.attributeName)}>Сохранить</button>
                                <button onClick={() => setEditingAttribute(null)}>Отмена</button>
                            </>
                        ) : (
                            <>
                                <span>{attribute.attributeName}</span>
                                <div className="button-group">
                                    <button onClick={() => handleEditButtonClick(attribute.attributeId)} className="btn-edit">Редактировать</button>
                                    {attribute.isDeleted ? (
                                        <button onClick={() => handleRestoreAttribute(attribute.attributeId)} className="btn-restore">Восстановить</button>
                                    ) : (
                                        <button onClick={() => handleDeleteAttribute(attribute.attributeId)} className="btn-delete">Удалить</button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttributesEditor;
