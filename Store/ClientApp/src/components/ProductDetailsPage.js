import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import sendRequest from './SendRequest';
import ProductItem from './ProductItem';
import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [reviews, setReviews] = useState([]);
    const [attributes, setAttributes] = useState([]);

    useEffect(() => {
        sendRequest(`/api/Products/GetProductDetails`, 'GET', null, { productId })
            .then((response) => {
                setProduct(response);
                setAttributes(response.attributes);
            })
            .catch((error) => {
                setNotification({ show: true, message: 'Ошибка при загрузке деталей товара: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });

        sendRequest(`/api/Comments/GetProductReviews`, 'GET', null, { productId })
            .then((response) => {
                setReviews(response?.reviews);
            })
            .catch((error) => {
                setNotification({ show: true, message: 'Ошибка при загрузке отзывов о товаре: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            });
    }, [productId]);

    if (!product) {
        return <div>Loading...</div>;
    }

    const handleQuantityChange = (productId, amount) => {
        setQuantity(prevQuantity => Math.max(prevQuantity + amount, 1));
    };

    const handleRatingChange = (value) => {
        setRating(value);
    };

    const handleReviewSubmit = () => {
        var userName = sessionStorage.getItem("userName");
        var userId = sessionStorage.getItem("userId");
        if (!userName) {
            setNotification({ show: true, message: 'Чтобы отправить отзыв нужно авторизоваться.', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }
        if (!rating || !reviewText.trim()) {
            setNotification({ show: true, message: 'Чтобы отправить отзыв нужно выбрать оценку и написать отзыв.', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        sendRequest('/api/Comments/AddReview', 'POST', null, {
            productId,
            userId,
            rating,
            Comment: reviewText
        }).then(response => {
            console.log('Отправка отзыва:', response);
            setRating(0);
            setReviewText('');
            setNotification({ show: true, message: 'Отзыв успешно отправлен!', type: 'success' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);

            sendRequest(`/api/Comments/GetProductReviews`, 'GET', null, { productId })
                .then((response) => {
                    setReviews(response?.reviews);
                })
                .catch((error) => {
                    setNotification({ show: true, message: 'Ошибка при загрузке отзывов о товаре: ' + error.message, type: 'error' });
                    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                });
        })
            .catch(error => {
                setNotification({ show: true, message: 'Ошибка при отправке отзыва: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                console.error('Ошибка при отправке отзыва:', error);
            });
    };

    const handleAddToCart = () => {
        var userId = sessionStorage.getItem("userId");
        if (!userId) {
            setNotification({ show: true, message: 'Для добавления товара в корзину необходимо войти в систему.', type: 'error' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            return;
        }

        sendRequest('/api/Cart/AddToCart', 'POST', {
            productId,
            userId,
            quantity
        })
            .then(response => {
                console.log('Товар добавлен в корзину:', response);
                setNotification({ show: true, message: 'Товар успешно добавлен в корзину!', type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            })
            .catch(error => {
                setNotification({ show: true, message: 'Ошибка при добавлении товара в корзину: ' + error.message, type: 'error' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
                console.error('Ошибка при добавлении товара в корзину:', error);
            });
    };

    const formatReviewDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    return (
        <div className="product-details-page">
            <ProductItem
                product={product}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                onAddToCart={handleAddToCart}
            />
            <div className="product-description">
                <h3>Описание товара</h3>
                <p>{product?.description}</p>
            </div>

            <div className="product-attributes">
                <h3>Характеристики товара</h3>
                <ul>
                    {attributes.map(attribute => (
                        <li key={attribute.attributeId}>
                            <strong>{attribute.attributeName}:</strong> {attribute.value}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="product-reviews">
                <h4>Написать отзыв</h4>
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <label key={star} className={star <= rating ? 'filled' : ''}>
                            <input
                                type="radio"
                                name="rating"
                                value={star}
                                checked={rating === star}
                                onChange={() => handleRatingChange(star)}
                            />
                        </label>
                    ))}
                </div>
                <textarea
                    className="review-textarea"
                    placeholder="Введите ваш отзыв"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
                <button className="submit-review-button" onClick={handleReviewSubmit}>
                    Отправить
                </button>
                {notification.show && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            </div>
            <div className="product-reviews">
                <h4>Отзывы о товаре</h4>
                {Array.isArray(reviews) && reviews.length > 0 ? (
                    <ul>
                        {reviews
                            .filter((review) => !review.isDeleted)
                            .map((review) => (
                                <li key={review.reviewId}>
                                    <p>{review.userName}</p>
                                    <p>Дата: {formatReviewDate(review.reviewDate)}</p>
                                    <p>Оценка: {review.rating}</p>
                                    <p>{review.comment}</p>
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p>Отзывов пока нет</p>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;
