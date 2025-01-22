import React, { useEffect } from 'react';
import '../styles/Notification.css';

const Notification = ({ type, message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(); // Закрытие уведомления через 3 секунды
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification ${type === 'success' ? 'success' : 'error'}`}>
            <h3>{type === 'success' ? 'Успешно' : 'Ошибка'}</h3>
            <p>{message}</p>
        </div>
    );
};

export default Notification;
