import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';

const UsersListPage = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterIsBanned, setFilterIsBanned] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        sendRequest('/api/User/GetUsers', 'GET')
            .then(response => {
                // Исключаем администраторов из списка пользователей
                const filteredUsers = response.filter(user => user.role !== 'Admin');
                setUsers(filteredUsers);
            })
            .catch(error => {
                console.error('Ошибка при загрузке списка пользователей:', error);
            });
    }, []);

    useEffect(() => {
        const results = users.filter(user =>
            (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.number.includes(searchTerm)) &&
            (filterRole === '' || user.role === filterRole) &&
            (!filterIsBanned || user.isBanned === filterIsBanned)
        );
        setSearchResults(results);
    }, [searchTerm, filterRole, filterIsBanned, users]);

    const handleSearch = event => {
        setSearchTerm(event.target.value);
    };

    const handleRoleFilterChange = event => {
        setFilterRole(event.target.value);
    };

    const handleIsBannedFilterChange = event => {
        setFilterIsBanned(event.target.checked);
    };

    const handleToggleUserStatus = (userId, isBanned) => {
        const newStatus = !isBanned;
        sendRequest(`/api/User/${newStatus ? 'BanUser' : 'UnbanUser'}`, 'POST', null, { userId })
            .then(response => {
                console.log(response.message);
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.userId === userId ? { ...user, isBanned: newStatus } : user
                    )
                );
            })
            .catch(error => {
                console.error(`Ошибка при ${newStatus ? 'блокировке' : 'разблокировке'} пользователя:`, error);
            });
    };

    const handleToggleUserRole = (userId, role) => {
        const newRole = role === 'Manager' ? 'User' : 'Manager';
        sendRequest(`/api/User/${newRole === 'Manager' ? 'MakeManager' : 'RemoveManager'}`, 'POST', null, { userId })
            .then(response => {
                console.log(response.message);
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user.userId === userId ? { ...user, role: newRole } : user
                    )
                );
            })
            .catch(error => {
                console.error(`Ошибка при ${newRole === 'Manager' ? 'назначении' : 'снятии'} пользователя с роли менеджера:`, error);
            });
    };

    return (
        <div>
            <h2>Список пользователей</h2>
            <input
                type="text"
                placeholder="Поиск по имени, почте или номеру телефона"
                value={searchTerm}
                onChange={handleSearch}
            />
            <div>
                <label>
                    Роль:
                    <select value={filterRole} onChange={handleRoleFilterChange}>
                        <option value="">Все</option>
                        <option value="User">Пользователь</option>
                        <option value="Manager">Менеджер</option>
                        {/* Не включаем опцию для администратора */}
                    </select>
                </label>
            </div>
            <div>
                <label>
                    Заблокирован:
                    <input
                        type="checkbox"
                        checked={filterIsBanned}
                        onChange={handleIsBannedFilterChange}
                    />
                </label>
            </div>
            <ul>
                {searchResults.map(user => (
                    <li key={user.userId}>
                        <div>Имя: {user.username}</div>
                        <div>Email: {user.email}</div>
                        <div>Номер телефона: {user.number}</div>
                        <div>Роль: {user.role}</div>
                        <div>Заблокирован: {user.isBanned ? 'Да' : 'Нет'}</div>
                        <button onClick={() => handleToggleUserStatus(user.userId, user.isBanned)}>
                            {user.isBanned ? 'Разблокировать' : 'Заблокировать'}
                        </button>
                        {user.role === 'User' ? (
                            <button onClick={() => handleToggleUserRole(user.userId, user.role)}>
                                Сделать менеджером
                            </button>
                        ) : (
                            <button onClick={() => handleToggleUserRole(user.userId, user.role)}>
                                Убрать роль
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UsersListPage;
