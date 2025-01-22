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
            const updatedCart = [];
            const removedItems = [];

            for (const item of cartItems) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/Parts/${item.partId}`);
                    const product = response.data;

                    if (product.stockQuantity > 0) {
                        updatedCart.push({ ...item, stockQuantity: product.stockQuantity });
                    } else {
                        removedItems.push(item);
                    }
                } catch (error) {
                    console.error(`Ошибка проверки товара ${item.partId}:`, error);
                }
            }

            if (removedItems.length > 0) {
                setCartItems(updatedCart);
                removedItems.forEach((item) =>
                    showNotification({
                        type: 'error',
                        message: `Товар "${item.name}" был удален из корзины, так как его нет в наличии.`,
                    })
                );
            }
        };

        checkStock();
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
            return [...prevItems, { ...item, quantity: 1 }];
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

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        localStorage.removeItem('cartTimestamp');
    };

    const isInCart = (partId) => cartItems.some((item) => item.partId === partId);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
