import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Catalog.css";
import { API_BASE_URL } from '../../config';
import DropdownFilter from "../ui/DropdownFilter";
import ProductList from "../ui/ProductList";

const AutoParts = () => {
    const [filters, setFilters] = useState({
        category: "all",
        brand: null,
        model: null,
        generation: null,
        bodyType: null,
    });

    const [categories] = useState([
        { value: "all", label: "Все запчасти" },
        { value: "autoboxes", label: "Автобоксы" },
        { value: "roof_racks", label: "Багажники" },
        { value: "parts_accessories", label: "Запчасти и аксессуары" },
    ]);

    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [generations, setGenerations] = useState([]);
    const [bodyTypes, setBodyTypes] = useState([]);
    const [parts, setParts] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const categoryMap = {
        all: "Все запчасти",
        autoboxes: "Автобоксы",
        roof_racks: "Багажники",
        parts_accessories: "Запчасти и аксессуары",
    };

    const categoryName = categoryMap[filters.category] || "Категория не найдена";

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                setIsAdmin(false);
                setIsLoading(false);
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
                }
            } catch (err) {
                console.error("Ошибка при получении данных пользователя:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Запрос для получения деталей
    const fetchParts = async () => {
        try {
            const { category, brand, model, generation, bodyType } = filters;
            setParts([]);  // Очистка списка деталей перед новым запросом
            const response = await axios.get(`${API_BASE_URL}/Parts/ByCategory/${category}`, {
                params: {
                    brandId: brand?.brandId,
                    modelId: model?.modelId,
                    generationId: generation?.generationId,
                    bodyTypeId: bodyType?.bodyTypeId,
                },
            });
            setParts(response.data);  // Обновляем состояние с полученными данными
        } catch (error) {
            console.error("Ошибка загрузки деталей:", error);
        }
    };

    useEffect(() => {
        fetchParts();
    }, [filters.category, filters.brand, filters.model, filters.generation, filters.bodyType]);

    // Запрос для получения брендов
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/Brands`);
                setBrands(response.data);
            } catch (error) {
                console.error("Ошибка загрузки марок:", error);
            }
        };
        fetchBrands();
    }, []);

    // Запрос для получения моделей по выбранному бренду
    useEffect(() => {
        const fetchModels = async () => {
            if (filters.brand) {
                try {
                    // Исправленный запрос, теперь используем filters.brand.brandId для правильного получения моделей
                    const response = await axios.get(`${API_BASE_URL}/Models/ByBrand/${filters.brand.brandId}`);
                    setModels(response.data);
                } catch (error) {
                    console.error("Ошибка загрузки моделей:", error);
                }
            } else {
                setModels([]);  // Если бренд не выбран, сбрасываем модели
                setGenerations([]);  // Также сбрасываем поколения
                setBodyTypes([]);  // И сбрасываем типы кузова
            }
        };
        fetchModels();
    }, [filters.brand]);

    // Запрос для получения поколений по модели
    useEffect(() => {
        const fetchGenerations = async () => {
            if (filters.model) {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/Generations/ByModel/${filters.model.modelId}`
                    );
                    setGenerations(response.data);
                } catch (error) {
                    console.error("Ошибка загрузки поколений:", error);
                }
            } else {
                setGenerations([]);  // Если модель не выбрана, сбрасываем поколения
                setBodyTypes([]);  // И сбрасываем типы кузова
            }
        };
        fetchGenerations();
    }, [filters.model]);

    // Запрос для получения типов кузова по выбранному поколению
    useEffect(() => {
        const fetchBodyTypes = async () => {
            if (filters.generation) {
                try {
                    const response = await axios.get(
                        `${API_BASE_URL}/BodyTypes/ByGeneration/${filters.generation.generationId}`
                    );
                    setBodyTypes(response.data);
                } catch (error) {
                    console.error("Ошибка загрузки типов кузова:", error);
                }
            } else {
                setBodyTypes([]);  // Если поколение не выбрано, сбрасываем типы кузова
            }
        };
        fetchBodyTypes();
    }, [filters.generation]);

    const handleFilterChange = (filterType, selectedOption) => {
        setFilters((prev) => {
            const newFilters = { ...prev, [filterType]: selectedOption };

            // Сброс зависимых фильтров
            if (filterType === "brand") {
                newFilters.model = null;
                newFilters.generation = null;
                newFilters.bodyType = null;
            } else if (filterType === "model") {
                newFilters.generation = null;
                newFilters.bodyType = null;
            } else if (filterType === "generation") {
                newFilters.bodyType = null;
            }

            return newFilters;
        });
    };

    const handleCategoryChange = (category) => {
        setFilters((prev) => ({
            ...prev,
            category,
            brand: null,
            model: null,
            generation: null,
            bodyType: null,
        }));
        setModels([]);  // Сбрасываем модели при смене категории
        setGenerations([]);  // И сбрасываем поколения
        setBodyTypes([]);  // Сбрасываем типы кузова
    };

    const resetFilters = () => {
        setFilters({ category: "all", brand: null, model: null, generation: null, bodyType: null });
    };

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div className="catalog-container">
            <aside className="filters">
                <label>Фильтры</label>
                <DropdownFilter
                    label="Категория"
                    options={categories}
                    selected={categories.find((cat) => cat.value === filters.category)}
                    onChange={(value) => handleCategoryChange(value.value)}
                    getOptionLabel={(option) => option.label}
                />

                <DropdownFilter
                    label="Марка авто"
                    options={brands}
                    selected={filters.brand}
                    onChange={(value) => handleFilterChange("brand", value)}
                    getOptionLabel={(option) => option.name}
                />

                {filters.brand && (
                    <DropdownFilter
                        label="Модель"
                        options={models}
                        selected={filters.model}
                        onChange={(value) => handleFilterChange("model", value)}
                        getOptionLabel={(option) => option.name}
                    />
                )}

                {filters.model && (
                    <DropdownFilter
                        label="Поколение"
                        options={generations}
                        selected={filters.generation}
                        onChange={(value) => handleFilterChange("generation", value)}
                        getOptionLabel={(option) => option.year}
                    />
                )}

                {filters.generation && (
                    <DropdownFilter
                        label="Тип кузова"
                        options={bodyTypes}
                        selected={filters.bodyType}
                        onChange={(value) => handleFilterChange("bodyType", value)}
                        getOptionLabel={(option) => option.bodyTypeName}
                    />
                )}

                <button className="reset-filters-button" onClick={resetFilters}>
                    Сбросить фильтры
                </button>
            </aside>

            <main className="catalog-items">
                <h1>{categoryName}</h1>
                {parts.length === 0 ? (
                    <p>Нет товаров, соответствующих выбранным фильтрам.</p>
                ) : (
                    <ProductList products={parts} isAdmin={isAdmin} />
                )}
            </main>
        </div>
    );
};

export default AutoParts;