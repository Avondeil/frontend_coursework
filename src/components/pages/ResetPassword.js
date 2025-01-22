import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';
import axios from "axios";
import '../styles/Auth.css';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState(null);

    const { showNotification } = useNotification(); // Хук для уведомлений
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.newPassword || !formData.confirmPassword) {
            setError("Заполните все поля");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Пароли не совпадают");
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
                email: formData.email,
                newPassword: formData.newPassword,
            });

            if (response.status === 200) {
                showNotification({
                    type: 'success',
                    message: 'Пароль успешно восстановлен!',
                });
                navigate("/auth");
            }
        } catch (error) {
            setError(error.response?.data?.message || "Ошибка при восстановлении пароля");
        }
    };

    return (
        <div className="auth">
            <h1>Восстановление пароля</h1>
            <form className="auth-form" onSubmit={handleResetPassword}>
                <label>Электронная почта <span className="required">*</span></label>
                <div className="input-wrapper">
                    <input
                        type="email"
                        name="email"
                        maxLength="320"
                        placeholder="Введите email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <label>Новый пароль <span className="required">*</span></label>
                <div className="input-wrapper">
                    <input
                        type="password"
                        name="newPassword"
                        maxLength="30"
                        placeholder="Введите новый пароль"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <label>Повторите новый пароль <span className="required">*</span></label>
                <div className="input-wrapper">
                    <input
                        type="password"
                        name="confirmPassword"
                        maxLength="30"
                        placeholder="Повторите новый пароль"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                {error && <div className="error">{error}</div>}

                <div className="auth-buttons">
                    <button type="submit">Восстановить</button>
                </div>
            </form>
        </div>
    );
};

export default ResetPassword;
