import React, { useState, useEffect } from 'react';
import '../styles/CheckoutModal.css';
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { AddressSuggestions } from 'react-dadata';

const CheckoutModal = ({ isOpen, onClose, selectedItems }) => {
    const [addressSuggestion, setAddressSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();
    const { removeSelectedItems } = useCart();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!addressSuggestion) {
            showNotification({ type: 'error', message: 'Пожалуйста, выберите корректный адрес из подсказок.' });
            return;
        }

        if (selectedItems.length === 0) {
            showNotification({ type: 'error', message: 'Нет выбранных товаров для оформления.' });
            return;
        }

        setLoading(true);

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            showNotification({ type: 'error', message: 'Токен отсутствует. Войдите в аккаунт.' });
            setLoading(false);
            return;
        }

        try {
            // Сохраняем selectedItems в localStorage
            localStorage.setItem('selectedItems', JSON.stringify(selectedItems));

            const response = await axios.post(`${API_BASE_URL}/order/create-payment`, {
                deliveryAddress: addressSuggestion.value,
                orderItems: selectedItems.map((item) => ({
                    PartId: item.partId,
                    Quantity: item.quantity
                }))
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Ответ от сервера:', response.data);
            const { paymentId, confirmationUrl } = response.data;

            console.log('confirmationUrl:', confirmationUrl);
            if (!confirmationUrl) {
                showNotification({ type: 'error', message: 'Не удалось получить URL для оплаты.' });
                setLoading(false);
                return;
            }

            localStorage.setItem('currentPaymentId', paymentId);

            window.location.href = confirmationUrl;

        } catch (err) {
            if (err.response && err.response.status === 401) {
                showNotification({ type: 'error', message: 'Ошибка 401: Неавторизован. Проверьте токен.' });
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
            } else {
                showNotification({ type: 'error', message: `Ошибка при выполнении запроса: ${err.response?.data || err.message}` });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => document.body.classList.remove('no-scroll');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Оформить заказ</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Адрес доставки <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <AddressSuggestions
                            token={process.env.REACT_APP_DADATA_TOKEN}
                            value={addressSuggestion}
                            onChange={setAddressSuggestion}
                            inputProps={{
                                className: 'react-dadata__input',
                                placeholder: 'Введите адрес доставки',
                                required: true,
                            }}
                        />
                    </div>
                    <div className="auth-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Перенаправление...' : 'Оплатить'}
                        </button>
                    </div>
                    <button type="button" onClick={onClose} className="close-btn">Закрыть</button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;