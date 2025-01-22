import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AutoPartsTransition.css";

const AutoPartsTransition = () => {
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate("/autoparts");
    };

    return (
        <div className="auto-parts-transition-content">
            <h2 className="auto-parts-transition-title">
                Подберите запчасть для вашего авто
            </h2>
            <p className="auto-parts-transition-description">
                Найдите идеальные детали и аксессуары для вашего автомобиля с помощью нашего каталога с удобной фильтрацией. Просто выберите параметры вашего авто, и мы подберем все необходимые компоненты для вас.
            </p>
            <button className="auto-parts-transition-button" onClick={handleButtonClick}>
                Перейти к выбору запчастей
            </button>
        </div>
    );
};

export default AutoPartsTransition;
