import React, { useState, useEffect } from "react";
import { useNotification } from "../contexts/NotificationContext";
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import '../styles/ProfileOrders.css';
import { useCart } from "../contexts/CartContext"; // Контекст для корзины
import CancelOrderModal from "../ui/CancelOrderModal"; // Импортируем модальное окно

const ProfileOrders = () => {
    const [orders, setOrders] = useState([]); // Список заказов
    const [isLoading, setIsLoading] = useState(true); // Индикатор загрузки
    const [productDetails, setProductDetails] = useState({}); // Детали продуктов
    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState({}); // Статус открытых заказов
    const { showNotification } = useNotification(); // Хук для уведомлений
    const { addToCart } = useCart(); // Хук для добавления товаров в корзину
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // Видимость модального окна
    const [orderToCancel, setOrderToCancel] = useState(null); // Заказ для отмены

    const toggleOrderDetails = (orderId) => {
        setIsOrderDetailsOpen((prevState) => ({
            ...prevState,
            [orderId]: !prevState[orderId],
        }));
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token") || sessionStorage.getItem("token");

                if (!token) {
                    throw new Error("Пользователь не вошел в аккаунт.");
                }

                const response = await axios.get(`${API_BASE_URL}/order/user-orders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = response.data;

                // Проверяем структуру данных
                if (!Array.isArray(data)) {
                    throw new Error("Полученные данные не являются массивом заказов.");
                }

                setOrders(data); // Устанавливаем заказы

                // Собираем все partId для запроса картинок и других данных
                const partIds = data.flatMap(order => order.items.map(item => item.partId));

                if (partIds.length > 0) {
                    fetchProductDetails(partIds);
                }
            } catch (error) {
                console.error("Ошибка при загрузке заказов:", error);
            } finally {
                setIsLoading(false); // Завершаем загрузку
            }
        };

        const fetchProductDetails = async (partIds) => {
            try {
                const details = {};
                for (const partId of partIds) {
                    if (!partId) continue; // Пропускаем запросы без partId

                    const response = await axios.get(`${API_BASE_URL}/Parts/${partId}`);

                    details[partId] = response.data; // Сохраняем детали по partId
                }
                setProductDetails(details); // Обновляем данные о товарах
            } catch (error) {
                console.error("Ошибка при загрузке деталей товаров:", error);
            }
        };

        fetchOrders();
    }, []);

    // Обработчик для открытия модального окна отмены заказа
    const handleCancelOrderClick = (orderId) => {
        setOrderToCancel(orderId);
        setIsCancelModalOpen(true);
    };

    // Обработчик для отмены заказа
    const cancelOrder = async () => {
        if (!orderToCancel) return;

        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                throw new Error("Пользователь не авторизован.");
            }

            const response = await axios.post(`${API_BASE_URL}/Order/cancel/${orderToCancel}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status !== 200) {
                showNotification({
                    type: 'error',
                    message: 'Произошла ошибка при отмене заказа.',
                });
                throw new Error(`Ошибка: ${response.status}`);
            }

            // Обновляем список заказов после отмены
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.orderId === orderToCancel
                        ? { ...order, status: "Отменён" } // Обновляем статус на "Отменён"
                        : order
                )
            );
            showNotification({
                type: 'success',
                message: 'Заказ отменен.',
            });
        } catch (error) {
            console.error("Ошибка при отмене заказа:", error);
        } finally {
            setIsCancelModalOpen(false);
            setOrderToCancel(null);
        }
    };

    // Обработчик для удаления заказа
    const deleteOrder = async (orderId) => {
        try {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                throw new Error("Пользователь не авторизован.");
            }

            const response = await axios.delete(`${API_BASE_URL}/Order/delete/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status !== 200) {
                showNotification({
                    type: 'error',
                    message: 'Произошла ошибка при удалении заказа.',
                });
                throw new Error(`Ошибка: ${response.status}`);
            }

            // Удаляем заказ из состояния после удаления в базе
            setOrders((prevOrders) => prevOrders.filter((order) => order.orderId !== orderId));
            showNotification({
                type: 'success',
                message: 'Заказ успешно удален.',
            });
        } catch (error) {
            console.error("Ошибка при удалении заказа:", error);
        }
    };

    // Обработчик для повторения заказа
    const repeatOrder = async (orderId) => {
        const order = orders.find(order => order.orderId === orderId);
        if (!order) {
            showNotification({
                type: 'error',
                message: 'Заказ не найден.',
            });
            return;
        }

        // Обновляем корзину с актуальными данными о товаре
        for (const item of order.items) {
            try {
                const productResponse = await axios.get(`${API_BASE_URL}/Parts/${item.partId}`);
                const product = productResponse.data;

                addToCart({
                    ...item,
                    price: product.price,
                    name: product.name,
                    stockQuantity: product.stockQuantity
                });
            } catch (error) {
                console.error(`Ошибка при обновлении товара ${item.partId}:`, error);
            }
        }

        showNotification({
            type: 'success',
            message: 'Товары из заказа добавлены в корзину.',
        });
    };

    if (isLoading) {
        return <div className="profile-orders">Загрузка...</div>;
    }

    return (
        <div className="profile-orders">
            <h1 className="profile-title">Мои заказы</h1>

            {orders.length === 0 ? ( // Проверяем, есть ли заказы
                <div className="no-orders">
                    <p>Заказов не найдено</p>
                </div>
            ) : (
                orders.map((order) => (
                    <div className="order-section" key={order.orderId}>
                        <div
                            className="order-header"
                            onClick={() => toggleOrderDetails(order.orderId)}
                        >
                            <span>
                                Заказ #{order.orderId} от {new Date(order.orderDate).toLocaleDateString()}
                            </span>
                            <span className="order-status">
                                {order.status}
                            </span>
                            <span
                                className={`arrow ${isOrderDetailsOpen[order.orderId] ? "open" : ""}`}
                            ></span>
                        </div>
                        {isOrderDetailsOpen[order.orderId] && (
                            <div className="order-details">
                                {order.items.length > 0 ? (
                                    order.items.map((item) => {
                                        const details = productDetails[item.partId] || {};
                                        return (
                                            <div className="order-item" key={item.partId}>
                                                <img
                                                    src={details.imageUrl || "https://via.placeholder.com/100"}
                                                    alt={details.name || item.name}
                                                    className="item-image"
                                                />
                                                <div className="item-info">
                                                    <p className="item-name">{details.name || item.name}</p>
                                                    <p className="item-quantity">
                                                        {item.quantity} шт. x {item.price} ₽
                                                        <p className="address-p"><strong>Адрес доставки:</strong> {order.deliveryAddress}</p>
                                                    </p>
                                                </div>
                                                <p className="item-price">
                                                    Цена: {item.price} ₽
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>Нет доступных товаров</p>
                                )}
                                <div className="order-summary">
                                    <p>Итого: {order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)} ₽</p>
                                    <div className="button-block">
                                        {(order.status === "Доставлен" || order.status === "Отменён") ? (
                                            <>
                                                <button className="repeat-order-button" onClick={() => repeatOrder(order.orderId)}>
                                                    Повторить заказ
                                                </button>
                                                <button className="order-action-button" onClick={() => deleteOrder(order.orderId)}>
                                                    Удалить заказ
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className={`order-action-button ${order.status === "В пути" ? "disabled" : ""}`}
                                                onClick={() => handleCancelOrderClick(order.orderId)}
                                                disabled={order.status === "В пути"}
                                            >
                                                Отменить заказ
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
            <CancelOrderModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={cancelOrder}
                orderNumber={orderToCancel}
            />
        </div>
    );
};

export default ProfileOrders;