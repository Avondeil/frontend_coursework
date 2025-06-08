import React from 'react';
import { FaVk, FaTelegramPlane, FaYoutube } from 'react-icons/fa'; // Импорт иконок
import "../styles/Footer.css";
import {Link} from "react-router-dom";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-logo">
                    <img src="/logo.png" alt="Компания Логотип"/>
                </div>
                <div className="footer-links">
                    <ul>
                        <li><Link to="/about" >О нас</Link></li>
                        <li><a target="_blank" href="https://yadi.sk/i/jCY2cK4PgK2xGw">Политика конфиденциальности</a></li>
                    </ul>
                </div>
                <div className="footer-social">
                    <a href="#" className="social-icon" aria-label="VK">
                        <FaVk/>
                    </a>
                    <a href="#" className="social-icon" aria-label="Telegram">
                        <FaTelegramPlane/>
                    </a>
                    <a href="#" className="social-icon" aria-label="YouTube">
                        <FaYoutube/>
                    </a>
                </div>
            </div>
            <div className="footer-contacts">
                <div className="phone">
                    <p>Телефон: <a href="tel:+79999999999">+7 (999) 999-99-99</a></p>
                </div>
                    <div className="emails">
                        <p>Электронная почта: <a href="mailto:support@ekbdetal.ru">support@ekbdetal.ru</a>, <a
                            href="mailto:sales@ekbdetal.ru">sales@ekbdetal.ru</a></p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 ЕКБДеталь. Все права защищены.</p>
                </div>
        </footer>
);
};

export default Footer;
