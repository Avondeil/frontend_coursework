import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';
import axios from "axios";
import '../styles/Auth.css';
import VerificationModal from "../ui/VerificationModal";

const Auth = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [error, setError] = useState(null);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [tempToken, setTempToken] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError("Заполните все поля");
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const { token, requiresVerification } = response.data;

            if (requiresVerification) {
                setTempToken(token);
                setShowVerificationModal(true);
                return;
            }

            if (formData.rememberMe) {
                localStorage.setItem("token", token);
            } else {
                sessionStorage.setItem("token", token);
            }
            showNotification({
                type: 'success',
                message: 'Успешный вход!',
            });

            const redirectPath = new URLSearchParams(location.search).get('redirect') || '/profile';
            navigate(redirectPath);
        } catch (error) {
            setError(error.response?.data?.message || "Ошибка авторизации");
        }
    };

    const handleConfirmCode = async (code) => {
        try {
            await axios.post(`${API_BASE_URL}/auth/verify-code`, {
                email: formData.email,
                code,
                tempToken,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setShowVerificationModal(false);
            if (formData.rememberMe) {
                localStorage.setItem("token", tempToken);
            } else {
                sessionStorage.setItem("token", tempToken);
            }
            showNotification({
                type: 'success',
                message: 'Успешный вход!',
            });

            const redirectPath = new URLSearchParams(location.search).get('redirect') || '/profile';
            navigate(redirectPath);
        } catch (error) {
            throw new Error("Неверный код");
        }
    };

    const handleResendCode = async () => {
        try {
            await axios.post(`${API_BASE_URL}/auth/resend-code`, {
                email: formData.email,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            showNotification({
                type: 'success',
                message: 'Код отправлен повторно!',
            });
        } catch (error) {
            setError(error.response?.data?.message || "Ошибка отправки кода");
        }
    };

    const handleRegistration = () => {
        navigate("/registration");
    };

    return (
        <div className="auth">
            <h1>Вход в личный кабинет</h1>
            <form className="auth-form" onSubmit={handleLogin}>
                <label>Логин <span className="required">*</span></label>
                <div className="input-wrapper">
                    <input
                        type="text"
                        name="email"
                        maxLength="320"
                        placeholder="Введите логин"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <label>Пароль <span className="required">*</span></label>
                <div className="input-wrapper">
                    <input
                        type={passwordVisible ? "text" : "password"}
                        name="password"
                        maxLength="30"
                        placeholder="Введите пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="button" className="toggle-password" onClick={togglePasswordVisibility}>
                        {passwordVisible ? "🔓" : "🔒"}
                    </button>
                </div>
                {error && <div className="error">{error}</div>}
                <div className="auth-options">
                    <div className="remember-me">
                        <input
                            type="checkbox"
                            id="remember"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                        />
                        <label className="remember-label" htmlFor="remember">Запомнить меня</label>
                    </div>
                    <Link to="/reset-password">Забыли пароль?</Link>
                </div>

                <div className="auth-buttons">
                    <button type="submit">Вход</button>
                    <button type="button" onClick={handleRegistration}>Регистрация</button>
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

export default Auth;