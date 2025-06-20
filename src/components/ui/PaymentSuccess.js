import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { useNotification } from "../contexts/NotificationContext";
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { removeSelectedItems } = useCart();

    useEffect(() => {
        const checkPaymentStatus = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const paymentId = queryParams.get('payment_id') || localStorage.getItem('currentPaymentId');

            if (!paymentId) {
                showNotification({ type: 'error', message: 'Идентификатор платежа не найден' });
                navigate('/cart');
                return;
            }

            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/order/check-payment/${paymentId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.status === 'succeeded') {
                    showNotification({ type: 'success', message: 'Оплата прошла успешно! Заказ оформлен.' });

                    // Удаляем товары из корзины из заказа
                    const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
                    if (selectedItems.length > 0) {
                        removeSelectedItems(selectedItems);
                        localStorage.removeItem('selectedItems');
                    }

                    localStorage.removeItem('currentPaymentId');
                    navigate('/cart');
                } else {
                    showNotification({ type: 'error', message: 'Платеж не подтвержден' });
                    navigate('/cart');
                }
            } catch (error) {
                showNotification({ type: 'error', message: 'Ошибка при проверке платежа' });
                navigate('/cart');
            }
        };

        checkPaymentStatus();
    }, [navigate, showNotification, removeSelectedItems]);

    return (
        <div className="payment-success-container">
            <h2>Проверка статуса платежа...</h2>
            <p>Пожалуйста, подождите, идет обработка вашего платежа.</p>
        </div>
    );
};

export default PaymentSuccess;