import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from "../contexts/NotificationContext";

const ProfileInformation = ({ userData }) => {
    const navigate = useNavigate();
    const { showNotification } = useNotification(); // Хук для уведомлений
    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        showNotification({
            type: 'success',
            message: 'Успешный выход из аккаунта.',
        });
        navigate('/auth');
    };

    return (
        <>
            <h1 className="profile-title">Профиль</h1>
            <div className="profile-info">
                <div className="profile-details">
                    <div className="profile-row">
                        <label>Полное имя</label>
                        <input type="text" value={userData?.fullName || ''} readOnly />
                    </div>
                    <div className="profile-row">
                        <label>Телефон</label>
                        <input type="text" value={userData?.phone || ''} readOnly />
                    </div>
                    <div className="profile-row">
                        <label>Электронная почта</label>
                        <input type="email" value={userData?.email || ''} readOnly />
                    </div>
                </div>
            </div>
            <div className="profile-actions">
                <button className="logout-btn" onClick={handleLogout}>Выйти</button>
            </div>
        </>
    );
};

export default ProfileInformation;
