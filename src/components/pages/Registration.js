import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from "../contexts/NotificationContext";
import { API_BASE_URL } from '../../config';

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
    const { showNotification } = useNotification(); // Хук для уведомлений
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // Обработчик для проверки телефона
    const handlePhoneChange = (e) => {
        // Регулярное выражение для разрешения только цифр и знака "+"
        const regex = /^[+]?[0-9]*$/;
        const { value } = e.target;

        // Если значение соответствует регулярному выражению, обновляем поле
        if (regex.test(value)) {
            setFormData({
                ...formData,
                phone: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Сброс ошибок
        setError(null);

        // Простая валидация формы
        const errors = {};

        if (!formData.fullName) errors.fullName = 'Поле обязательно для заполнения';
        if (!formData.email) errors.email = 'Поле обязательно для заполнения';
        if (!formData.password) errors.password = 'Поле обязательно для заполнения';
        if (!formData.confirmPassword) errors.confirmPassword = 'Поле обязательно для заполнения';
        if (!formData.phone) errors.phone = 'Поле обязательно для заполнения';
        if (formData.password !== formData.confirmPassword) errors.passwordMismatch = 'Пароли не совпадают';
        if (!formData.agreement) errors.agreement = 'Необходимо согласие на обработку данных';

        // Если есть ошибки, показываем их через уведомления
        if (Object.keys(errors).length > 0) {
            for (const [key, message] of Object.entries(errors)) {
                showNotification({
                    type: 'error',
                    message: message,
                });
            }
            return;
        }

        // Отправка данных на сервер через axios
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            });

            if (response.status === 200) {
                // Успешная регистрация
                showNotification({
                    type: 'success',
                    message: 'Успешная регистрация!',
                });
                navigate('/auth');
            }
        } catch (err) {
            if (err.response) {
                // Ошибка от сервера
                setError(err.response.data.message || 'Ошибка регистрации');
                showNotification({
                    type: 'error',
                    message: err.response.data.message || 'Ошибка регистрации',
                });
            } else {
                // Ошибка при выполнении запроса
                setError('Ошибка при выполнении запроса');
                showNotification({
                    type: 'error',
                    message: 'Ошибка при выполнении запроса',
                });
            }
        }
    };

    return (
        <div className="registration-container">
            <div className="registration">
                <h1>Регистрация</h1>
                <form className="registration-form" onSubmit={handleSubmit}>
                    <label>
                        Фамилия Имя Отчество (ФИО) <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            maxLength="255"
                            placeholder="Введите ФИО"
                            required
                        />
                    </div>

                    <label>
                        E-mail (будет являться логином для входа) <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            maxLength="30"
                            placeholder="Введите свой E-mail"
                            required
                        />
                    </div>

                    <label>
                        Пароль <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength="6"
                            maxLength="30"
                            placeholder="Введите пароль"
                            required
                        />
                    </div>

                    <label>
                        Подтверждение пароля <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            maxLength="30"
                            placeholder="Повторите пароль"
                            required
                        />
                    </div>

                    <label>
                        Номер телефона <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}  // Используем новый обработчик
                            minLength="10"
                            maxLength="11"
                            placeholder="Введите номер телефона"
                            required
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className="registration-options">
                        <div className="registration-checkbox">
                            <input
                                type="checkbox"
                                name="agreement"
                                checked={formData.agreement}
                                onChange={handleChange}
                                id="registration-agreement"
                            />
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
