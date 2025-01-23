import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import "../styles/Catalog.css";
import DropdownFilter from "../ui/DropdownFilter";
import ProductList from "../ui/ProductList";

const Catalog = () => {
    const { category } = useParams();
    const [filters, setFilters] = useState({});
    const [products, setProducts] = useState([]);
    const [parameterOptions, setParameterOptions] = useState({});
    const [filteredProducts, setFilteredProducts] = useState([]);

    const categoryMap = {
        autoboxes: "Автобоксы",
        roof_racks: "Багажники",
        parts_accessories: "Запчасти и аксессуары",
    };
    const categoryName = categoryMap[category] || "Категория не найдена";

    // Получение параметров для фильтров
    useEffect(() => {
        const fetchParameters = async () => {
            try {
                let url = "";
                if (category === "autoboxes") {
                    url = `${API_BASE_URL}/AutoboxParameters`;
                } else if (category === "roof_racks") {
                    url = `${API_BASE_URL}/RoofRackParameters`;
                } else if (category === "parts_accessories") {
                    url = `${API_BASE_URL}/SparePartsParameters`;
                }

                if (url) {
                    const response = await axios.get(url);
                    const data = response.data;

                    const unique = (key) =>
                        [...new Set(data.map((item) => item[key]?.toString()).filter(Boolean))].sort();

                    setParameterOptions({
                        dimensionsMm: unique("dimensionsMm"),
                        lengthCm: unique("lengthCm"),
                        loadKg: unique("loadKg"),
                        volumeL: unique("volumeL"),
                        openingSystem: unique("openingSystem"),
                        color: unique("color"),
                        countryOfOrigin: unique("countryOfOrigin"),
                        material: unique("material"),
                        mountingType: unique("mountingType"),
                        crossbarShape: unique("crossbarShape"),
                    });
                    setProducts(data); // Сохраняем все продукты
                }
            } catch (error) {
                console.error("Ошибка загрузки параметров:", error);
            }
        };

        fetchParameters();
    }, [category]);

    // Получение фильтрованных продуктов
    const fetchFilteredProducts = async () => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = `${API_BASE_URL}/Parts/ByCategory/${category}?${queryParams}`;
            const response = await axios.get(url);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error("Ошибка загрузки продуктов:", error);
        }
    };

    // Фильтрация продуктов при изменении фильтров
    useEffect(() => {
        fetchFilteredProducts();
    }, [filters]);

    // Фильтрация доступных опций
    const filterOptions = (filterKey) => {
        let filtered = products;
        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                filtered = filtered.filter((product) => product[key]?.toString() === filters[key]?.toString());
            }
        });
        const uniqueValues = [...new Set(filtered.map((product) => product[filterKey]?.toString()).filter(Boolean))].sort();
        return uniqueValues;
    };

    // Обработка изменений фильтров
    const handleFilterChange = (filterType, selectedOption) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: selectedOption || null,
        }));
    };

    // Сброс фильтров
    const resetFilters = () => {
        setFilters({});
    };

    // Генерация фильтров
    const renderFiltersByCategory = () => {
        const params = parameterOptions;

        const createDropdown = (label, key, enableRange = false) => (
            <DropdownFilter
                key={key}
                label={label}
                options={filterOptions(key) || []}
                selected={filters[key]}
                onChange={(value) => handleFilterChange(key, value)}
                getOptionLabel={(opt) => opt} // Предполагается, что опции — строки
                enableRange={enableRange} // Включение диапазона
            />
        );

        switch (category) {
            case "autoboxes":
                return (
                    <>
                        {createDropdown("Размер (мм)", "dimensionsMm")}
                        {createDropdown("Нагрузочный лимит (кг)", "loadKg", true)}
                        {createDropdown("Объем (литры)", "volumeL", true)}
                        {createDropdown("Система открывания", "openingSystem")}
                        {createDropdown("Цвет", "color")}
                        {createDropdown("Страна производителя", "countryOfOrigin")}
                    </>
                );
            case "roof_racks":
                return (
                    <>
                        {createDropdown("Длина (см)", "lengthCm", true)}
                        {createDropdown("Материал", "material")}
                        {createDropdown("Нагрузочный лимит (кг)", "loadKg", true)}
                        {createDropdown("Тип крепления", "mountingType")}
                        {createDropdown("Форма поперечин", "crossbarShape")}
                    </>
                );
            case "parts_accessories":
                return (
                    <>
                        {createDropdown("Цвет", "color")}
                        {createDropdown("Страна производителя", "countryOfOrigin")}
                    </>
                );
            default:
                return null;
        }
    };

    const navigate = useNavigate();

    // Переход на страницу продукта
    const handleProductClick = (partId) => {
        navigate(`/product/${partId}`);
    };

    return (
        <div className="catalog-container">
            <div className="filters">
                <label>Фильтры</label>
                {renderFiltersByCategory()}
                <button className="reset-filters-button" onClick={resetFilters}>
                    Сбросить фильтры
                </button>
            </div>
            <main className="catalog-items">
                <h1>Каталог</h1>
                <ProductList products={filteredProducts} categoryName={categoryName} />
            </main>
        </div>
    );
};

export default Catalog;
