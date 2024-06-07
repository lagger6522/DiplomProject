import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './CommentsModalContent.css';

const CommentsModalContent = () => {
    const [comments, setComments] = useState([]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        sendRequest('/api/Comments/GetAllComments', 'GET')
            .then(response => {
                setComments(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке комментариев:', error);
                setNotification({ show: true, message: 'Ошибка при загрузке комментариев: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    }, []);

    const handleToggleVisibility = (reviewId, isVisible) => {
        sendRequest('/api/Comments/ToggleCommentVisibility', 'POST', null, {
            reviewId,
            isVisible,
        })
            .then(response => {
                console.log(response.message);
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment.reviewId === reviewId ? { ...comment, isDeleted: isVisible } : comment
                    )
                );
                setNotification({ show: true, message: response.message, type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            })
            .catch(error => {
                console.error('Ошибка при изменении видимости комментария:', error);
                setNotification({ show: true, message: 'Ошибка при изменении видимости комментария: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    };

    const handleBanUser = (userId) => {
        sendRequest(`/api/User/BanUser`, 'POST', null, { userId })
            .then(response => {
                console.log(response.message);
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment.userId === userId ? { ...comment, isBanned: true } : comment
                    )
                );
                setNotification({ show: true, message: response.message, type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            })
            .catch(error => {
                console.error('Ошибка при блокировке пользователя:', error);
                setNotification({ show: true, message: 'Ошибка при блокировке пользователя: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    };

    const handleUnbanUser = (userId) => {
        sendRequest(`/api/User/UnbanUser`, 'POST', null, { userId })
            .then(response => {
                console.log(response.message);
                setComments(prevComments =>
                    prevComments.map(comment =>
                        comment.userId === userId ? { ...comment, isBanned: false } : comment
                    )
                );
                setNotification({ show: true, message: response.message, type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            })
            .catch(error => {
                console.error('Ошибка при разблокировке пользователя:', error);
                setNotification({ show: true, message: 'Ошибка при разблокировке пользователя: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    };

    return (
        <div className="comments-modal-content">
            {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            <h2>Все комментарии</h2>
            <ul>
                {comments.map(comment => (
                    <li key={comment.reviewId} className="comment-card">
                        <div>
                            <strong>Пользователь ID:</strong> {comment.userId}
                        </div>
                        <div>
                            <strong>Email:</strong> {comment.userEmail}
                        </div>
                        <div>
                            <strong>Пользователь:</strong> {comment.userName}
                        </div>
                        <div>
                            <strong>Оценка:</strong> {comment.rating}
                        </div>
                        <div>
                            <strong>Комментарий:</strong> {comment.comment}
                        </div>
                        <div>
                            <strong>Дата:</strong> {comment.reviewDate}
                        </div>
                        <div className="actions">
                            {comment.isDeleted ? (
                                <button onClick={() => handleToggleVisibility(comment.reviewId, false)} className="button-show">
                                    Сделать видимым
                                </button>
                            ) : (
                                <button onClick={() => handleToggleVisibility(comment.reviewId, true)} className="button-hide">
                                    Скрыть комментарий
                                </button>
                            )}
                            {comment.isBanned ? (
                                <button onClick={() => handleUnbanUser(comment.userId)} className="button-unban">
                                    Разблокировать пользователя
                                </button>
                            ) : (
                                <button onClick={() => handleBanUser(comment.userId)} className="button-ban">
                                    Заблокировать пользователя
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentsModalContent;
