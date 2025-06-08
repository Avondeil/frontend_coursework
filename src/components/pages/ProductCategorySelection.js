import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProductCategorySelection.css";

const ProductCategorySelection = () => {
    const navigate = useNavigate();

    const handleCategoryClick = (category) => {
        navigate('/autoparts', { state: { category } });
    };


    return (
        <div className="product-category-selection-container">
            <h1 className="product-category-selection-title">Выбор категории товара</h1>
            <div className="product-category-selection-sections">
                {/* Автобоксы */}
                <div className="product-category-selection-section">
                    <h2>Автобоксы</h2>
                    <p>
                        Автобоксы различных моделей и размеров для вашего автомобиля. Удобно
                        перевозить вещи.
                    </p>
                    <button
                        className="product-category-selection-button"
                        onClick={() => handleCategoryClick("autoboxes")}
                    >
                        Перейти в каталог
                    </button>
                </div>

                {/* Багажники */}
                <div className="product-category-selection-section">
                    <h2>Багажники</h2>
                    <p>
                        Багажники для автомобилей. Выбирайте из различных типов и материалов.
                    </p>
                    <button
                        className="product-category-selection-button"
                        onClick={() => handleCategoryClick("roof_racks")}
                    >
                        Перейти в каталог
                    </button>
                </div>

                {/* Запчасти и аксессуары */}
                <div className="product-category-selection-section">
                    <h2>Запчасти и аксессуары</h2>
                    <p>
                        Запчасти для автомобилей, аксессуары и многое другое. Для каждого
                        автомобиля.
                    </p>
                    <button
                        className="product-category-selection-button"
                        onClick={() => handleCategoryClick("parts_accessories")}
                    >
                        Перейти в каталог
                    </button>
                </div>

                {/* Запчасти для автомобиля */}
                <div className="product-category-selection-section">
                    <h2>Запчасти для автомобиля</h2>
                    <p>
                        Найдите идеальные детали и аксессуары для вашего автомобиля с помощью нашего каталога с удобной фильтрацией.
                        Просто выберите параметры вашего авто, и мы подберем все необходимые компоненты для вас.
                    </p>
                    <button
                        className="product-category-selection-button"
                        onClick={() => handleCategoryClick("all")}
                    >
                        Перейти в каталог
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCategorySelection;