import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from '../../config';
import { useNotification } from "../contexts/NotificationContext";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]); // Список заказов
    const [isLoading, setIsLoading] = useState(true); // Индикатор загрузки
    const [error, setError] = useState(null); // Ошибка при загрузке данных
    const [isAdmin, setIsAdmin] = useState(false); // Флаг для проверки прав администратора
    const { showNotification } = useNotification(); // Хук для уведомлений

    // Получаем данные о пользователе и проверяем его статус (админ или нет)
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                setError("Токен отсутствует. Войдите в аккаунт.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                // Если полученные данные содержат статус администратора, проверяем его
                if (response.data?.statusAdmin) {
                    setIsAdmin(true);
                }
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 401) {
                        setError("Ошибка 401: Неавторизован. Проверьте токен.");
                    } else if (err.response.status === 404) {
                        setError("Ошибка 404: Пользователь не найден.");
                    } else {
                        setError(`Ошибка сервера: ${err.response.statusText}`);
                    }
                } else {
                    setError(`Ошибка при выполнении запроса: ${err.message}`);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Получаем активные заказы с сервера
    useEffect(() => {
        const fetchOrders = async () => {
            if (isLoading) return;

            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");

                if (!token) {
                    throw new Error("Пользователь не авторизован.");
                }

                const response = await axios.get(`${API_BASE_URL}/Order/active-orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = response.data;

                if (!Array.isArray(data)) {
                    throw new Error("Полученные данные не являются массивом заказов.");
                }

                setOrders(data);
            } catch (error) {
                console.error("Ошибка при загрузке заказов:", error);
                setError("Ошибка при загрузке заказов.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [isLoading]);

    // Обработчик для изменения статуса заказа
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                throw new Error("Пользователь не авторизован.");
            }

            const response = await axios.put(
                `${API_BASE_URL}/Order/update-status/${orderId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status !== 200) {
                setError("Произошла ошибка при изменении статуса заказа.");
                throw new Error(`Ошибка: ${response.status}`);
            }

            showNotification({
                type: 'success',
                message: `Заказу #${orderId} успешно изменен статус на "${newStatus}"`,
            });

            // Обновляем состояние заказов
            setOrders((prevOrders) => {
                if (newStatus === "Доставлен") {
                    // Удаляем доставленный заказ из списка
                    return prevOrders.filter((order) => order.orderId !== orderId);
                }
                // Обновляем статус для других заказов
                return prevOrders.map((order) =>
                    order.orderId === orderId ? { ...order, status: newStatus } : order
                );
            });
        } catch (error) {
            console.error("Ошибка при изменении статуса заказа:", error);
            setError("Ошибка при изменении статуса заказа.");
        }
    };

    if (isLoading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="profile-orders">
            <h1 className="profile-title">Управление заказами</h1>
            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>Нет активных заказов</p>
                </div>
            ) : (
                orders.map((order) => (
                    <div className="order-section" key={order.orderId}>
                        <div className="order-header">
                            <span>
                                Заказ #{order.orderId} от {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                            <span className="order-status">{order.status}</span>
                        </div>
                        <div className="order-details">
                            <p><strong>Имя пользователя:</strong> {order.user.fullName}</p>
                            <p><strong>Номер телефона:</strong> {order.user.phone}</p>
                            <p><strong>Эл. почта:</strong> {order.user.email}</p>
                            <p className="address-p"><strong>Адрес доставки:</strong> {order.deliveryAddress}</p>
                            {order.items.length > 0 ? (
                                order.items.map((item) => (
                                    <div className="order-item" key={item.partId}>
                                        <div className="item-info">
                                            <p className="item-name">{item.name}</p>
                                            <p className="item-quantity">
                                                {item.quantity} шт. x {item.price} ₽
                                            </p>
                                        </div>
                                        <p className="item-price">
                                            Цена: {item.price} ₽
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p>Нет доступных товаров</p>
                            )}
                            {isAdmin && (
                                <div className="order-summary">
                                    <p>
                                        Итого:{" "}
                                        {order.items.reduce(
                                            (acc, item) => acc + item.price * item.quantity,
                                            0
                                        )}{" "}
                                        ₽
                                    </p>
                                    <div className="order-status-controls">
                                        <button
                                            className={`order-action-button ${order.status === "Формируется" ? "disabled" : ""}`}
                                            onClick={() => updateOrderStatus(order.orderId, "Формируется")}
                                            disabled={order.status === "Формируется"}
                                        >
                                            Формировать
                                        </button>
                                        <button
                                            className={`order-action-button ${order.status === "В пути" ? "disabled" : ""}`}
                                            onClick={() => updateOrderStatus(order.orderId, "В пути")}
                                            disabled={order.status === "В пути"}
                                        >
                                            В пути
                                        </button>
                                        <button
                                            className={`order-action-button ${order.status === "Доставлен" ? "disabled" : ""}`}
                                            onClick={() => updateOrderStatus(order.orderId, "Доставлен")}
                                            disabled={order.status === "Доставлен"}
                                        >
                                            Доставлен
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminOrders;
