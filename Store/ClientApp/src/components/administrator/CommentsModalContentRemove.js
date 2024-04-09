import React, { useState, useEffect } from 'react';
import sendRequest from '../SendRequest';
import './CommentsModalContentRemove.css';

const CommentsModalContentRemove = () => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        sendRequest('/api/Categories/GetAllComments', 'GET')
            .then(response => {
                setComments(response);
            })
            .catch(error => {
                console.error('Ошибка при загрузке комментариев:', error);
            });
    }, []);

    const handleToggleVisibility = (reviewId, isVisible) => {
        sendRequest('/api/Categories/ToggleCommentVisibility', 'POST', null, {
            reviewId,
            isVisible,
        })
            .then(response => {
                console.log(response.message);
                // Обновление состояния comments после успешного запроса
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

    return (
        <div className="comments-modal-content-remove">
            <h2>Все комментарии</h2>
            <ul>
                {comments.map(comment => (
                    <li key={comment.reviewId}>
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
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentsModalContentRemove;
