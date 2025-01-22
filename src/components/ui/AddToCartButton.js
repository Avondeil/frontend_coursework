import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import Notification from './Notification';

const AddToCartButton = ({ product }) => {
    const { addToCart, cartItems } = useCart(); // Получаем функцию добавления товара и данные корзины
    const [notification, setNotification] = useState(null); // Хук состояния для уведомлений

    // Проверка, есть ли товар в корзине
    const isInCart = cartItems.some((item) => item.partId === product.partId);

    // Обработчик клика
    const handleClick = () => {
        if (isInCart) {
            setNotification({ type: 'error', message: 'Этот товар уже в корзине' }); // Уведомление, если товар уже в корзине
        } else {
            addToCart(product); // Добавляем товар в корзину
            setNotification({ type: 'success', message: 'Товар успешно добавлен в корзину' }); // Уведомление об успешном добавлении
        }
    };

    return (
        <>
            <button onClick={handleClick} className="buy-button">
                {isInCart ? 'Уже в корзине' : 'В корзину'}
            </button>
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)} // Закрытие уведомления
                />
            )}
        </>
    );
};

export default AddToCartButton;
