import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './CommentsModalContentRemove.css';

const CommentsModalContentRemove = () => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        sendRequest('/api/Comments/GetAllComments', 'GET')
            .then(response => {
                setComments(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке комментариев:', error);
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
            })
            .catch(error => {
                console.error('Ошибка при изменении видимости комментария:', error);
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
            })
            .catch(error => {
                console.error('Ошибка при блокировке пользователя:', error);
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
            })
            .catch(error => {
                console.error('Ошибка при разблокировке пользователя:', error);
            });
    };


    return (
        <div className="comments-modal-content-remove">
            <h2>Все комментарии</h2>
            <ul>
                {comments.map(comment => (
                    <li key={comment.reviewId}>
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
                        {comment.isDeleted ? (
                            <button onClick={() => handleToggleVisibility(comment.reviewId, false)}>
                                Сделать видимым
                            </button>
                        ) : (
                            <button onClick={() => handleToggleVisibility(comment.reviewId, true)}>
                                Скрыть комментарий
                            </button>
                        )}
                        <div>
                            {comment.isBanned ? (
                                <button onClick={() => handleUnbanUser(comment.userId)}>Разблокировать пользователя</button>
                            ) : (
                                <button onClick={() => handleBanUser(comment.userId)}>Заблокировать пользователя</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default CommentsModalContentRemove;
