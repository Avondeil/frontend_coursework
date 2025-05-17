import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import "../styles/ComparePage.css";

const ComparePage = () => {
    const [comparisonItems, setComparisonItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedItems = JSON.parse(localStorage.getItem("comparisonItems")) || [];
        setComparisonItems(storedItems);
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            if (comparisonItems.length === 0) return;
            try {
                const responses = await Promise.all(
                    comparisonItems.map((id) => axios.get(`${API_BASE_URL}/Parts/${id}`))
                );
                setProducts(responses.map((res) => res.data));
                setLoading(false);
            } catch (error) {
                console.error("Ошибка загрузки товаров:", error);
                setLoading(false);
            }
        };
        fetchProducts();
    }, [comparisonItems]);

    const handleRemove = (partId) => {
        const updatedItems = comparisonItems.filter((id) => id !== partId);
        setComparisonItems(updatedItems);
        localStorage.setItem("comparisonItems", JSON.stringify(updatedItems));
    };

    const clearComparison = () => {
        setComparisonItems([]);
        localStorage.removeItem("comparisonItems");
    };

    // Функция для извлечения всех характеристик, включая вложенные
    const getAllCharacteristics = (product) => {
        const characteristics = { ...product };
        delete characteristics.partId;
        delete characteristics.name;
        delete characteristics.imageUrl;
        delete characteristics.productTypeId;
        delete characteristics.autoboxParameter;
        delete characteristics.roofRackParameter;
        delete characteristics.sparePartsParameter;

        if (product.autoboxParameter) {
            Object.keys(product.autoboxParameter).forEach((key) => {
                characteristics[`autobox_${key}`] = product.autoboxParameter[key];
            });
        }
        if (product.roofRackParameter) {
            Object.keys(product.roofRackParameter).forEach((key) => {
                characteristics[`roofRack_${key}`] = product.roofRackParameter[key];
            });
        }
        if (product.sparePartsParameter) {
            Object.keys(product.sparePartsParameter).forEach((key) => {
                characteristics[`spareParts_${key}`] = product.sparePartsParameter[key];
            });
        }

        return characteristics;
    };

    // Функция для форматирования значения характеристики
    const formatCharacteristic = (value) => {
        if (value === null || value === undefined) return "-";
        if (typeof value === "object") {
            if (Array.isArray(value)) {
                return value.map((item) => {
                    return `${item.brandName || ""} ${item.modelName || ""} ${item.generationYear || ""} ${item.bodytypeName || ""}`.trim();
                }).join(", ");
            }
            return Object.entries(value)
                .map(([key, val]) => `${key}: ${val}`)
                .join(", ");
        }
        return value.toString();
    };

    // Функция для определения, является ли характеристика числовой
    const isNumericCharacteristic = (char, products) => {
        return products.every((product) => {
            const value = product[char];
            return typeof value === "number" || (typeof value === "string" && !isNaN(parseFloat(value)));
        });
    };

    // Перевод характеристик на русский
    const charTranslations = {
        price: "Цена (₽)",
        stockQuantity: "Количество на складе",
        description: "Описание",
        compatibilities: "Совместимость",
        // Вложенные характеристики для автобоксов
        autobox_dimensionsMm: "Размеры (мм)",
        autobox_loadKg: "Грузоподъемность (кг)",
        autobox_volumeL: "Объем (л)",
        autobox_openingSystem: "Система открытия",
        autobox_countryOfOrigin: "Страна производства",
        autobox_color: "Цвет",
        // Вложенные характеристики для багажников
        roofRack_lengthCm: "Длина (см)",
        roofRack_material: "Материал",
        roofRack_loadKg: "Грузоподъемность (кг)",
        roofRack_mountingType: "Тип крепления",
        roofRack_crossbarShape: "Форма поперечины",
        roofRack_countryOfOrigin: "Страна производства",
        roofRack_color: "Цвет",
        // Вложенные характеристики для запчастей
        spareParts_countryOfOrigin: "Страна производства",
        spareParts_color: "Цвет",
    };

    if (loading) return <div className="compare-page"><h1>Загрузка...</h1></div>;

    if (products.length === 0) {
        return (
            <div className="compare-page">
                <h1>Сравнение товаров</h1>
                <div className="empty-comparison">
                    <p>Выберите товары в каталоге для сравнения</p>
                    <button className="catalog-button" onClick={() => navigate("/catalog")}>
                        Перейти в каталог
                    </button>
                </div>
            </div>
        );
    }

    // Получаем все характеристики для каждого товара
    const allCharacteristics = products.map(getAllCharacteristics);

    // Находим общие характеристики для всех товаров
    const commonCharacteristics = Object.keys(allCharacteristics[0]).filter((key) =>
        allCharacteristics.every((char) => char.hasOwnProperty(key))
    );

    return (
        <div className="compare-page">
            <h1>Сравнение товаров</h1>
            <div className="compare-mini-cards">
                {products.map((product) => (
                    <div key={product.partId} className="mini-card">
                        <img
                            src={product.imageUrl || "https://via.placeholder.com/140"}
                            alt={product.name}
                        />
                        <h3>{product.name}</h3>
                        <button onClick={() => handleRemove(product.partId)}>
                            Удалить
                        </button>
                    </div>
                ))}
            </div>
            <table className="compare-table">
                <thead>
                <tr>
                    <th>Характеристика</th>
                    {products.map((product) => (
                        <th key={product.partId}>{product.name}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {commonCharacteristics.map((char) => (
                    <tr key={char}>
                        <td>{charTranslations[char] || char}</td>
                        {allCharacteristics.map((characteristics, index) => {
                            const value = characteristics[char];
                            let isBest = false;
                            let isWorst = false;

                            if (isNumericCharacteristic(char, allCharacteristics)) {
                                const parsedValue = typeof value === "string" ? parseFloat(value) : value;
                                const values = allCharacteristics.map(c => typeof c[char] === "string" ? parseFloat(c[char]) : c[char]);
                                isBest = parsedValue === Math.max(...values);
                                isWorst = parsedValue === Math.min(...values);
                            }

                            return (
                                <td
                                    key={index}
                                    className={isBest ? "best" : isWorst ? "worst" : ""}
                                >
                                    {formatCharacteristic(value)}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
            <button className="clear-button" onClick={clearComparison}>
                Очистить сравнение
            </button>
        </div>
    );
};

export default ComparePage;