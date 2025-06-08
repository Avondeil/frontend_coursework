import React, { useEffect, useState } from 'react';
import { CiMail } from "react-icons/ci";
import '../styles/SidebarModal.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaTelegramPlane, FaVk, FaYoutube } from "react-icons/fa";
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const SidebarModal = ({ isOpen, toggleModal }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    // Эффект для отслеживания токена
    useEffect(() => {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        setToken(storedToken);
    }, [isOpen]);

    // Проверка статуса администратора
    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) {
                setIsAdmin(false);
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.data?.statusAdmin) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                console.error("Ошибка при получении данных пользователя:", err);
                setIsAdmin(false);
            }
        };

        fetchUserData();
    }, [token]);

    // Блокировка прокрутки при открытии модального окна
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => document.body.classList.remove('no-scroll');
    }, [isOpen]);

    const handleProfileClick = () => {
        if (!token) {
            // Если токен отсутствует, перенаправляем на страницу входа
            navigate('/auth');
        } else {
            // Если токен есть, переходим на страницу профиля
            navigate('/profile');
        }
        toggleModal();
    };

    return (
        <>
            <div className={`sidebar-modal ${isOpen ? 'visible' : 'hidden'}`}>
                <div className="sidebar-header">
                    <Link to="/" onClick={toggleModal} id="logo_detal"></Link>
                    <button onClick={toggleModal} className="close-modal-btn">×</button>
                </div>
                <ul className="sidebar-links">
                    <li>
                        <Link to="/about" onClick={toggleModal}>О компании</Link>
                    </li>
                    <li>
                        <Link to="/catalog" onClick={toggleModal} className="catalog-link">Каталог</Link>
                    </li>
                    <li>
                        <Link to="/compare" onClick={toggleModal}>Сравнить запчасти</Link>
                    </li>
                    <li>
                        <a
                            className="profile-link"
                            onClick={handleProfileClick}
                        >
                            <img src="/person-icon.svg" height="24px" width="24px" alt="Icon" />
                            Личный кабинет
                        </a>
                    </li>
                    {!isAdmin && (
                        <li>
                            <Link to="/cart" onClick={toggleModal}>
                                <img src="/basket.svg" height="24px" width="24px" alt="Icon" />
                                Корзина
                            </Link>
                        </li>
                    )}
                </ul>
                <div className="sidebar-info">
                    <ul className="sidebar-links">
                        <li>
                            <a href="tel:+79999999999">
                                <img src="/phone.svg" alt="Icon" />
                                <p>+7 (999) 999-99-99<br />
                                    <span className="phone-text">Бесплатный номер</span>
                                </p>
                            </a>
                        </li>
                        <li>
                            <a href="mailto:support@ekbdetal.ru">
                                <CiMail className="icon-mail" />
                                <p>
                                    support@ekbdetal.ru<br />
                                    <span className="secondary-email">sales@ekbdetal.ru</span>
                                </p>
                            </a>
                        </li>

                        <div className="footer-social">
                            <a href="#" className="social-icon" aria-label="VK">
                                <FaVk />
                            </a>
                            <a href="#" className="social-icon" aria-label="Telegram">
                                <FaTelegramPlane />
                            </a>
                            <a href="#" className="social-icon" aria-label="YouTube">
                                <FaYoutube />
                            </a>
                        </div>
                    </ul>
                </div>
            </div>

            <div className={`backdrop ${isOpen ? 'show' : ''}`} onClick={toggleModal}></div>
        </>
    );
};

export default SidebarModal;