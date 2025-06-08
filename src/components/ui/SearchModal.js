import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../../config';
import '../styles/SearchModal.css';

const SearchModal = ({ isOpen, toggleModal }) => {
    // Строка поиска
    const [searchTerm, setSearchTerm] = useState("");
    // Все запчасти
    const [parts, setParts] = useState([]);
    // Отфильтрованные запчасти
    const [filteredParts, setFilteredParts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isOpen]);

    // Загружаем все запчасти из API
    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/Parts/ByCategory/all`)
            .then((response) => {
                setParts(response.data);
            })
            .catch((error) => {
                console.error("Ошибка при загрузке запчастей:", error);
            });
    }, []);

    // Фильтрация запчастей по строке поиска
    useEffect(() => {
        if (searchTerm.length > 0) {
            const filtered = parts.filter(part =>
                part.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredParts(filtered);
        } else {
            setFilteredParts([]);
        }
    }, [searchTerm, parts]);

    // Переход на страницу товара
    const handleProductClick = (partId) => {
        navigate(`/product/${partId}`);
        toggleModal();
    };

    // Очистить строку поиска при закрытии модального окна
    const handleCloseModal = () => {
        setSearchTerm('');
        toggleModal();
    };

    if (!isOpen) return null;

    return (
        <div className="search-modal-overlay">
            <div className="search-modal-content">
                <div className="search-input-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Введите название"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="close-modal" onClick={handleCloseModal}>×</button>
                </div>
                <div className="parts-list">
                    {filteredParts.length === 0 && searchTerm.length === 0 ? (
                        <p>Введите запрос для поиска запчастей</p>
                    ) : filteredParts.length === 0 ? (
                        <p>По введенным данным запчастей не найдено</p>
                    ) : (
                        filteredParts.map((part) => (
                            <div
                                key={part.partId}
                                className="part-item"
                                onClick={() => handleProductClick(part.partId)}
                            >
                                <img
                                    src={part.imageUrl}
                                    alt={part.name}
                                    className="part-image"
                                />
                                <div className="part-text">
                                    <h3>{part.name}</h3>
                                    <p>{part.description}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;