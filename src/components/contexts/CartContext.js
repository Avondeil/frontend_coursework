import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        const savedTimestamp = localStorage.getItem('cartTimestamp');

        if (savedCart && savedTimestamp) {
            const now = new Date().getTime();
            const cartAge = now - parseInt(savedTimestamp, 10);

            if (cartAge < 30 * 24 * 60 * 60 * 1000) {
                return JSON.parse(savedCart);
            }
        }

        return [];
    });

    const { showNotification } = useNotification();

    useEffect(() => {
        const checkStock = async () => {
            let updatedCart = [...cartItems];
            let hasChanges = false;

            for (const item of cartItems) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/Parts/${item.partId}`);
                    const product = response.data;

                    if (item.price !== product.price) {
                        updatedCart = updatedCart.map((cartItem) =>
                            cartItem.partId === item.partId
                                ? { ...cartItem, price: product.price }
                                : cartItem
                        );
                        hasChanges = true;
                        showNotification({
                            type: 'info',
                            message: `Цена товара "${item.name}" обновлена до ${product.price} руб.`,
                        });
                    }

                    if (product.stockQuantity <= 0 && item.stockQuantity > 0) {
                        updatedCart = updatedCart.map((cartItem) =>
                            cartItem.partId === item.partId
                                ? { ...cartItem, stockQuantity: 0, isSelected: false, price: product.price }
                                : cartItem
                        );
                        hasChanges = true;
                        showNotification({
                            type: 'error',
                            message: `Товар "${item.name}" стал недоступен и исключён из оформления.`,
                        });
                    } else if (product.stockQuantity > 0 && item.stockQuantity <= 0) {
                        updatedCart = updatedCart.map((cartItem) =>
                            cartItem.partId === item.partId
                                ? { ...cartItem, stockQuantity: product.stockQuantity, isSelected: true, price: product.price }
                                : cartItem
                        );
                        hasChanges = true;
                        showNotification({
                            type: 'success',
                            message: `Товар "${item.name}" снова в наличии и выбран для оформления.`,
                        });
                    } else if (product.stockQuantity > 0) {
                        updatedCart = updatedCart.map((cartItem) =>
                            cartItem.partId === item.partId
                                ? { ...cartItem, stockQuantity: product.stockQuantity, price: product.price }
                                : cartItem
                        );
                    }
                } catch (error) {
                    console.error(`Ошибка проверки товара ${item.partId}:`, error);
                }
            }

            if (hasChanges) {
                setCartItems(updatedCart);
            }
        };

        checkStock(); // Запуск при монтировании
        const intervalId = setInterval(checkStock, 30000); // Проверка каждые 30 секунд

        return () => clearInterval(intervalId); // Очистка при размонтировании
    }, [cartItems, showNotification]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        localStorage.setItem('cartTimestamp', new Date().getTime().toString());
    }, [cartItems]);

    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((cartItem) => cartItem.partId === item.partId);
            if (existingItem) {
                return prevItems.map((cartItem) =>
                    cartItem.partId === item.partId
                        ? { ...cartItem, quantity: cartItem.quantity }
                        : cartItem
                );
            }
            return [...prevItems, { ...item, quantity: 1, isSelected: true }];
        });
    };

    const removeFromCart = (partId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.partId !== partId));
    };

    const updateQuantity = (partId, quantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.partId === partId ? { ...item, quantity } : item
            )
        );
    };

    const toggleSelection = (partId) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.partId === partId
                    ? { ...item, isSelected: !item.isSelected && item.stockQuantity > 0 }
                    : item
            )
        );
    };

    const removeSelectedItems = () => {
        setCartItems((prevItems) => prevItems.filter((item) => !item.isSelected));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTimestamp');
    };

    const isInCart = (partId) => cartItems.some((item) => item.partId === partId);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                toggleSelection,
                isInCart,
                removeSelectedItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);