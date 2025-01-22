import React, { useState, useEffect } from 'react';
import '../styles/CheckoutModal.css';
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';
import { useCart } from '../contexts/CartContext'; // Хук для работы с корзиной
import axios from 'axios';

const CheckoutModal = ({ isOpen, onClose }) => {
    const { cartItems, clearCart } = useCart(); // Получаем данные корзины и метод для ее очистки
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification(); // Хук для уведомлений
    const handleAddressChange = (e) => {
        setDeliveryAddress(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!deliveryAddress) {
            showNotification({ type: 'error', message: 'Пожалуйста, введите адрес доставки.' });
            return;
        }

        if (cartItems.length === 0) {
            showNotification({ type: 'error', message: 'Корзина пуста. Добавьте товары для оформления заказа.' });
            return;
        }

        setLoading(true); // Включаем индикатор загрузки

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            showNotification({ type: 'error', message: 'Токен отсутствует. Войдите в аккаунт.' });
            setLoading(false);
            return;
        }

        // Формируем данные для отправки на сервер
        const orderRequest = {
            deliveryAddress,
            orderItems: cartItems.map((item) => ({
                partId: item.partId,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        try {
            const response = await axios.post(`${API_BASE_URL}/order/create`, orderRequest, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Если ответ успешен, показываем сообщение об успешном оформлении заказа
            showNotification({ type: 'success', message: response.data.message || 'Заказ успешно оформлен!' });
            clearCart(); // Очищаем корзину
        } catch (err) {
            // Обработка ошибок
            if (err.response && err.response.status === 401) {
                showNotification({ type: 'error', message: 'Ошибка 401: Неавторизован. Проверьте токен.' });
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
            } else {
                showNotification({ type: 'error', message: `Ошибка при выполнении запроса: ${err.message}` });
            }
        } finally {
            setLoading(false); // Завершаем загрузку
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

    if (!isOpen) return null; // Если модальное окно закрыто, ничего не рендерим

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Оформить заказ</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label>
                        Адрес доставки <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            name="deliveryAddress"
                            maxLength="320"
                            placeholder="Введите адрес доставки"
                            value={deliveryAddress}
                            onChange={handleAddressChange}
                            required
                        />
                    </div>
                    <div className="auth-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Оплата...' : 'Оплатить'}
                        </button>
                    </div>
                    <button type="button" onClick={onClose} className="close-btn">Закрыть</button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutModal;
