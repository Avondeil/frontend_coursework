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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    const fetchParts = async () => {
        try {
            const { category, brand, model, generation, bodyType } = filters;
            setParts([]);
            const response = await axios.get(`${API_BASE_URL}/Parts/ByCategory/${category}`, {
                params: {
                    brandId: brand?.brandId,
                    modelId: model?.modelId,
                    generationId: generation?.generationId,
                    bodyTypeId: bodyType?.bodyTypeId,
                },
            });
            setParts(response.data);
            setCurrentPage(1);
        } catch (error) {
            console.error("Ошибка загрузки деталей:", error);
        }
    };

    useEffect(() => {
        fetchParts();
    }, [filters.category, filters.brand, filters.model, filters.generation, filters.bodyType]);

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

    useEffect(() => {
        const fetchModels = async () => {
            if (filters.brand) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/Models/ByBrand/${filters.brand.brandId}`);
                    setModels(response.data);
                } catch (error) {
                    console.error("Ошибка загрузки моделей:", error);
                }
            } else {
                setModels([]);
                setGenerations([]);
                setBodyTypes([]);
            }
        };
        fetchModels();
    }, [filters.brand]);

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
                setGenerations([]);
                setBodyTypes([]);
            }
        };
        fetchGenerations();
    }, [filters.model]);

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
                setBodyTypes([]);
            }
        };
        fetchBodyTypes();
    }, [filters.generation]);

    const handleFilterChange = (filterType, selectedOption) => {
        setFilters((prev) => {
            const newFilters = { ...prev, [filterType]: selectedOption };

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
        setModels([]);
        setGenerations([]);
        setBodyTypes([]);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters({ category: "all", brand: null, model: null, generation: null, bodyType: null });
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentParts = parts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(parts.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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
                    <ProductList products={currentParts} isAdmin={isAdmin} />
                )}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            &lt;
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => handlePageChange(index + 1)}
                                className={currentPage === index + 1 ? "active" : ""}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            &gt;
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AutoParts;