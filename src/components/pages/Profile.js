import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import ProfileInformation from './ProfileInformation';
import ProfileOrders from './ProfileOrders';
import AdminOrders from "./AdminOrders";
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';
import '../styles/Profile.css';

const Profile = () => {
    const [userData, setUserData] = useState(null); // Данные пользователя
    const [error, setError] = useState(null); // Ошибки
    const [loading, setLoading] = useState(true); // Индикатор загрузки
    const [activePage, setActivePage] = useState('profile'); // Текущая активная страница
    const navigate = useNavigate(); // Хук для навигации
    const { showNotification } = useNotification(); // Хук для уведомлений

    const navigateAuth = () => {
        showNotification({
            type: 'error',
            message: 'Через 3 секунды вы будете перенаправлены на страницу входа',
        });
        setTimeout(() => {
            navigate('/auth');
        }, 3000);
    }

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                setError('Токен отсутствует. Войдите в аккаунт.');
                setLoading(false);
                navigateAuth();
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/user/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                setUserData(response.data);
            } catch (err) {
                if (err.response) {
                    // Ошибка от сервера
                    if (err.response.status === 401) {
                        setError('Ошибка 401: Неавторизован. Проверьте токен.');
                        navigateAuth();
                    } else if (err.response.status === 404) {
                        setError('Ошибка 404: Пользователь не найден.');
                        navigateAuth();
                    } else {
                        setError(`Ошибка сервера: ${err.response.statusText}`);
                    }
                } else {
                    // Ошибка при выполнении запроса
                    setError(`Ошибка при выполнении запроса: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const renderContent = () => {
        if (activePage === 'profile') {
            return <ProfileInformation userData={userData} />;
        }
        if (activePage === 'orders') {
            return <ProfileOrders />;
        }
        if (activePage === 'manage') {
            return <AdminOrders />
            }
        return null;
    };

    if (loading) {
        return <div className="loading-message">Загрузка данных...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!userData) {
        return <div className="error-message">Данные пользователя отсутствуют.</div>;
    }

    return (
        <div className="profile-settings">
            <div className="sidebar">
                <ul className="sidebar-menu">
                    <li
                        className={`sidebar-item ${activePage === 'profile' ? 'active' : ''}`}
                        onClick={() => setActivePage('profile')}
                    >
                        Профиль
                    </li>
                    {!userData.statusAdmin && (
                        <li
                            className={`sidebar-item ${activePage === 'orders' ? 'active' : ''}`}
                            onClick={() => setActivePage('orders')}
                        >
                            Заказы
                        </li>
                    )}
                    {userData.statusAdmin && (
                        <li
                            className={`sidebar-item ${activePage === 'manage' ? 'active' : ''}`}
                            onClick={() => setActivePage('manage')}
                        >
                            Управление
                        </li>
                    )}
                </ul>
            </div>
            <div className="profile-content">{renderContent()}</div>
        </div>
    );
};

export default Profile;
