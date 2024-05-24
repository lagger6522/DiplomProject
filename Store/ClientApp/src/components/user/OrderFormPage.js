import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import sendRequest from '../SendRequest';
import './OrderFormPage.css';

const OrderFormPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: sessionStorage.getItem('email') || '',
        phoneNumber: sessionStorage.getItem('number') || '',
        city: '',
        street: '',
        house: '',
        entrance: '',
        apartment: '',
        isPrivateHouse: false,
        paymentMethod: 'cash',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData((prevData) => ({
                ...prevData,
                [name]: checked,
                ...(name === 'isPrivateHouse' && checked && { entrance: '', apartment: '' }),
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanFormData = { ...formData };
        if (cleanFormData.isPrivateHouse) {
            delete cleanFormData.entrance;
            delete cleanFormData.apartment;
        }

        try {
            sendRequest("/api/Cart/CreateOrder", "POST", cleanFormData, { userId: sessionStorage.getItem('userId') })
                .then(response => {
                    console.log(response);
                    if (response !== "An error occurred while saving the entity changes. See the inner exception for details.") {
                        sendRequest("/api/Cart/ClearCart", "POST", null, { userId: sessionStorage.getItem('userId') });
                    }
                    navigate("/");
                })
                .catch(error => {
                    console.log(error);
                });

        } catch (error) {
            console.error('Произошла ошибка при оформлении заказа:', error);
        }
    };

    return (
        <div className="order-form-page">
            <h2>Оформление заказа</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Электронная почта:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label>
                <label>
                    Номер телефона:
                    <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
                </label>
                <label>
                    Город:
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </label>
                <label>
                    Улица:
                    <input type="text" name="street" value={formData.street} onChange={handleChange} required />
                </label>
                <label>
                    Дом:
                    <input type="text" name="house" value={formData.house} onChange={handleChange} required />
                </label>
                <label className="isPrivateHouse-label">
                    Частный дом
                    <input className="isPrivateHouse"
                        type="checkbox"
                        name="isPrivateHouse"
                        checked={formData.isPrivateHouse}
                        onChange={handleChange}
                    />
                </label>
                {!formData.isPrivateHouse && (
                    <>
                        <label>
                            Подъезд:
                            <input type="text" name="entrance" value={formData.entrance} onChange={handleChange} />
                        </label>
                        <label>
                            Квартира:
                            <input type="text" name="apartment" value={formData.apartment} onChange={handleChange} />
                        </label>
                    </>
                )}
                <label>
                    Способ оплаты:
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
                        <option value="cash">Наличные</option>
                        <option value="card">Карта при получении</option>
                    </select>
                </label>
                <button type="submit">Оформить заказ</button>
            </form>
        </div>
    );
};

export default OrderFormPage;
