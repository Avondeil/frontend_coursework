import React, { useState, useEffect } from 'react';
import SidebarModal from "./SidebarModal"; // Компонент модального окна
import PhoneListModal from "./PhoneListModal";
import { Link, useNavigate } from 'react-router-dom'; // useNavigate для перенаправления
import SearchModal from "./SearchModal"; // Импортируем модальное окно для поиска
import '../styles/Header.css';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

const Header = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isPhoneListOpen, setPhoneListOpen] = useState(false);
    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const navigate = useNavigate();

    const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));

    // Эффект, который следит за изменением токена
    useEffect(() => {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        setToken(storedToken);
    }, [navigate]);

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

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const togglePhoneList = () => {
        setPhoneListOpen(!isPhoneListOpen);
    };

    const toggleSearchModal = () => {
        setSearchModalOpen(!isSearchModalOpen);
    };

    const handleProfileClick = () => {
        if (!token) {
            // Если токен не существует, перенаправляем на страницу входа
            navigate('/auth');
        } else {
            // Если токен есть, переходим на страницу профиля
            navigate('/profile');
        }
    };

    return (
        <>
            <div className="header">
                <div className="header-left">
                    <a id="buttonMenu" onClick={toggleSidebar}></a>
                    <Link to="/" id="logo_detal"></Link>
                </div>
                <div className="header-right">
                    <a id="phone_list" onClick={togglePhoneList}></a>
                    <Link to="/compare" id="compare"></Link>
                    {isAdmin && <Link to="/add-part" id="add_part"></Link>}
                    <a id="search" onClick={toggleSearchModal}></a>
                    <button id="account_auth" onClick={handleProfileClick}></button>
                    {!isAdmin && <Link to="/cart" id="basket"></Link>}
                </div>
            </div>
            <SidebarModal isOpen={isSidebarOpen} toggleModal={toggleSidebar} />
            <PhoneListModal isOpen={isPhoneListOpen} toggleModal={togglePhoneList} />
            <SearchModal isOpen={isSearchModalOpen} toggleModal={toggleSearchModal} />
        </>
    );
};

export default Header;