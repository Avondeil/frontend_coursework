import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CheckoutModal from "../ui/CheckoutModal";
import { API_BASE_URL } from '../../config';
import '../styles/CartPage.css';
import { useNotification } from "../contexts/NotificationContext";

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, toggleSelection } = useCart();
    const { showNotification } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const closeModal = () => setIsModalOpen(false);

    const handleCheckout = async () => {
        const selectedItems = cartItems.filter((item) => item.isSelected);
        if (selectedItems.length === 0) {
            showNotification({
                type: 'error',
                message: 'Выберите хотя бы один товар для оформления.',
            });
            return;
        }

        const unavailableItems = [];
        for (const item of selectedItems) {
            try {
                const response = await axios.get(`${API_BASE_URL}/Parts/${item.partId}`);
                const product = response.data;

                if (product.stockQuantity < item.quantity) {
                    unavailableItems.push(item);
                }
            } catch (error) {
                showNotification({
                    type: 'error',
                    message: `Ошибка проверки товара "${item.name}".`,
                });
            }
        }

        if (unavailableItems.length > 0) {
            unavailableItems.forEach((item) => {
                showNotification({
                    type: 'error',
                    message: `Товар "${item.name}" недоступен в указанном количестве.`,
                });
            });
            return;
        }

        setIsModalOpen(true);
    };

    const handleQuantityChange = (partId, value) => {
        // Проверка на числовой ввод и минимальное значение 1
        const quantity = Math.max(1, Math.min(value, cartItems.find(item => item.partId === partId).stockQuantity));
        updateQuantity(partId, quantity);
    };

    const handleInputBlur = (partId, quantity) => {
        // Если поле пустое, ставим 1
        if (quantity === '' || quantity <= 0) {
            updateQuantity(partId, 1);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty">
                <h2>Корзина пуста</h2>
                <Link to="/catalog">Перейти в каталог</Link>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <h2>Ваша корзина</h2>
            <div className="cart-items">
                {cartItems.map((item) => (
                    <div key={item.partId} className="cart-item">
                        <input
                            type="checkbox"
                            className="cart-item-checkbox"
                            checked={item.isSelected && item.stockQuantity > 0}
                            onChange={() => toggleSelection(item.partId)}
                            disabled={item.stockQuantity <= 0}
                        />
                        <Link to={`/product/${item.partId}`}>
                            <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                        </Link>
                        <div className="cart-item-details">
                            <h3>
                                <Link to={`/product/${item.partId}`} className="cart-item-link">{item.name}</Link>
                            </h3>
                            <p>{item.description}</p>
                            <p>Цена: {item.price} руб.</p>
                            <p>
                                {item.stockQuantity > 0 ? `В наличии: ${item.stockQuantity} шт.` : <span className="out-of-stock">Нет в наличии</span>}
                            </p>
                            {item.stockQuantity > 0 ? (
                                <div className="cart-item-actions">
                                    <button onClick={() => removeFromCart(item.partId)}>Удалить</button>
                                    <div className="quantity-control">
                                        <button onClick={() => handleQuantityChange(item.partId, item.quantity - 1)}>-</button>
                                        <input
                                            type="number"
                                            value={item.quantity || ''}
                                            onChange={(e) => handleQuantityChange(item.partId, parseInt(e.target.value, 10))}
                                            onBlur={(e) => handleInputBlur(item.partId, e.target.value)}
                                            min="1"
                                            max={item.stockQuantity}
                                        />
                                        <button onClick={() => handleQuantityChange(item.partId, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                            ) : (
                                <button className="remove-button" onClick={() => removeFromCart(item.partId)}>Удалить</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-summary">
                <h3>Итого: {cartItems
                    .filter((item) => item.isSelected)
                    .reduce((acc, item) => acc + item.price * item.quantity, 0)} руб.</h3>
                <button onClick={handleCheckout} className="checkout-btn">Оформить заказ</button>
            </div>
            <CheckoutModal
                isOpen={isModalOpen}
                onClose={closeModal}
                selectedItems={cartItems.filter((item) => item.isSelected)}
            />
        </div>
    );
};

export default CartPage;