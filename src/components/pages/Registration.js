import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';
import '../styles/Auth.css';

const Registration = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        agreement: false,
    });

    const [error, setError] = useState(null);
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const regex = /^\+?[78]?\d{0,10}$/;

        if (regex.test(value)) {
            setFormData({ ...formData, phone: value });
        }
    };

    const validateForm = () => {
        const errors = {};
        const nameRegex = /^[A-Za-zА-Яа-яЁё\s]+$/;
        const phoneRegex = /^\+7\d{10}$|^8\d{10}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,30}$/;

        if (!formData.fullName || !nameRegex.test(formData.fullName)) {
            errors.fullName = 'Введите корректное ФИО (только буквы и пробелы)';
        }
        if (!formData.email || !emailRegex.test(formData.email)) {
            errors.email = 'Введите корректный email';
        }
        if (!formData.password || !passwordRegex.test(formData.password)) {
            errors.password = 'Пароль должен содержать хотя бы одну заглавную букву, цифру и быть от 6 до 30 символов';
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Пароли не совпадают';
        }
        if (!formData.phone || !phoneRegex.test(formData.phone)) {
            errors.phone = 'Введите корректный номер телефона (например, +79991234567 или 89001234567)';
        }
        if (!formData.agreement) {
            errors.agreement = 'Необходимо согласие на обработку данных';
        }

        Object.values(errors).forEach((msg) => showNotification({ type: 'error', message: msg }));
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!validateForm()) return;
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            });
            if (response.status === 200) {
                showNotification({ type: 'success', message: 'Успешная регистрация!' });
                navigate('/auth');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка регистрации');
            showNotification({ type: 'error', message: err.response?.data?.message || 'Ошибка регистрации' });
        }
    };

    return (
        <div className="registration-container">
            <div className="registration">
                <h1>Регистрация</h1>
                <form className="registration-form" onSubmit={handleSubmit}>
                    <label>ФИО <span className="required">*</span></label>
                    <div className="input-wrapper">
                        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Введите ФИО" required />
                    </div>

                    <label>Email <span className="required">*</span></label>
                    <div className="input-wrapper">
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Введите email" required />
                    </div>

                    <label>Пароль <span className="required">*</span></label>
                    <div className="input-wrapper">
                        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Введите пароль" required />
                    </div>

                    <label>Подтверждение пароля <span className="required">*</span></label>
                    <div className="input-wrapper">
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Повторите пароль" required />
                    </div>

                    <label>Номер телефона <span className="required">*</span></label>
                    <div className="input-wrapper">
                        <input type="text" name="phone" value={formData.phone} onChange={handlePhoneChange} placeholder="Введите номер телефона" required />
                    </div>

                    <div className="registration-options">
                        <div className="registration-checkbox">
                            <input type="checkbox" name="agreement" checked={formData.agreement} onChange={handleChange} id="registration-agreement" />
                            <label className="registration-label" htmlFor="registration-agreement">
                                Я согласен на обработку <Link target="_blank" to="https://disk.yandex.ru/i/P_7TNJcXbR8hog">персональных данных</Link>
                            </label>
                        </div>
                    </div>

                    <div className="registration-buttons">
                        <button type="submit">Зарегистрироваться</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registration;
