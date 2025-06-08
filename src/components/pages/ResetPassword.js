import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';
import axios from "axios";
import '../styles/Auth.css';
import VerificationModal from "../ui/VerificationModal";

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        email: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [error, setError] = useState(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

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
            await axios.post(`${API_BASE_URL}/auth/change-password`, {
                Email: formData.email,
            });
            setShowVerificationModal(true);
        } catch (error) {
            setError(error.response?.data?.message || "Ошибка при восстановлении пароля");
            showNotification({
                type: 'error',
                message: error.response?.data?.message || "Ошибка при восстановлении пароля",
            });
        }
    };

    const handleConfirmCode = async (code) => {
        try {
            await axios.post(`${API_BASE_URL}/auth/confirm-change-password`, {
                email: formData.email,
                code,
                newPassword: formData.newPassword,
            });
            setShowVerificationModal(false);
            showNotification({
                type: 'success',
                message: 'Пароль успешно восстановлен!',
            });
            navigate("/auth");
        } catch (error) {
            throw new Error("Неверный код");
        }
    };

    const handleResendCode = async () => {
        try {
            await axios.post(`${API_BASE_URL}/auth/change-password`, {
                Email: formData.email,
            });
            showNotification({
                type: 'success',
                message: 'Код отправлен повторно!',
            });
        } catch (error) {
            setError(error.response?.data?.message || "Ошибка отправки кода");
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
            {showVerificationModal && (
                <VerificationModal
                    email={formData.email}
                    onConfirm={handleConfirmCode}
                    onResend={handleResendCode}
                />
            )}
        </div>
    );
};

export default ResetPassword;