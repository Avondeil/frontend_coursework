import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';

const AddToCartButton = ({ product }) => {
    const { addToCart, isInCart } = useCart(); // Получаем функцию добавления товара и данные корзины
    const { showNotification } = useNotification();

    // Обработчик клика
    const handleClick = () => {
        if (isInCart(product.partId)) {
            showNotification({ type: 'error', message: 'Этот товар уже в корзине' }); // Уведомление, если товар уже в корзине
        } else {
            addToCart({ // Добавляем товар в корзину
                partId: product.partId,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                description: product.description,
                stockQuantity: product.stockQuantity,
            });
            showNotification({ type: 'success', message: 'Товар успешно добавлен в корзину' }); // Уведомление об успешном добавлении
        }
    };

    return (
        <button onClick={handleClick} className="buy-button">
            {isInCart(product.partId) ? 'Уже в корзине' : 'В корзину'}
        </button>
    );
};

export default AddToCartButton;