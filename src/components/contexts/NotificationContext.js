import React, { createContext, useState, useContext } from 'react';
import Notification from '../ui/Notification';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = ({ type, message }) => {
        setNotification({ type, message });
        // Убираем уведомление через 3 секунды
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
        </NotificationContext.Provider>
    );
};
