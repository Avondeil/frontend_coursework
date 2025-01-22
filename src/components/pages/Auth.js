import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';
import axios from "axios";
import '../styles/Auth.css';

const Auth = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation(); // Получаем текущий путь (например, корзина)
    const { showNotification } = useNotification(); // Хук для уведомлений

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

            const { token } = response.data;
            if (formData.rememberMe) {
                localStorage.setItem("token", token);
            } else {
                sessionStorage.setItem("token", token);
            }
            showNotification({
                type: 'success',
                message: 'Успешный вход!',
            });

            // Получаем путь редиректа из query параметра и перенаправляем
            const redirectPath = new URLSearchParams(location.search).get('redirect') || '/profile';
            navigate(redirectPath);
        } catch (error) {
            setError(error.response?.data?.message || "Ошибка авторизации");
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
        </div>
    );
};

export default Auth;
