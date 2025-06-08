import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/Catalog.css";
import { API_BASE_URL } from "../../config";
import DropdownFilter from "../ui/DropdownFilter";
import ProductList from "../ui/ProductList";

const AutoParts = () => {
    const [filters, setFilters] = useState({
        category: "all",
        brand: null,
        model: null,
        generation: null,
        bodyType: null,
        categoryParams: {},
        priceFrom: "",
        priceTo: "",
    });

    const [categories] = useState([
        { value: "all", label: "Все запчасти" },
        { value: "autoboxes", label: "Автобоксы" },
        { value: "roof_racks", label: "Багажники" },
        { value: "parts_accessories", label: "Запчасти и аксессуары" },
    ]);

    const [sortOrder, setSortOrder] = useState("");
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [generations, setGenerations] = useState([]);
    const [bodyTypes, setBodyTypes] = useState([]);
    const [parts, setParts] = useState([]);
    const [filteredParts, setFilteredParts] = useState([]);
    const [parametersData, setParametersData] = useState([]);
    const [parameterOptions, setParameterOptions] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPartsLoading, setIsPartsLoading] = useState(false);
    const [isParametersLoading, setIsParametersLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const abortControllerRef = useRef(null);
    const priceTimeoutRef = useRef(null);

    const categoryMap = {
        all: "Все запчасти",
        autoboxes: "Автобоксы",
        roof_racks: "Багажники",
        parts_accessories: "Запчасти и аксессуары",
    };

    const validCategories = ["all", "autoboxes", "roof_racks", "parts_accessories"];
    const categoryName = categoryMap[filters.category] || "Категория не найдена";

    const location = useLocation();

    useEffect(() => {
        const categoryFromState = location.state?.category;
        if (categoryFromState && validCategories.includes(categoryFromState)) {
            setFilters((prev) => ({
                ...prev,
                category: categoryFromState,
                brand: null,
                model: null,
                generation: null,
                bodyType: null,
                categoryParams: {},
                priceFrom: "",
                priceTo: "",
            }));
        }
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [location.state]);

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
                setError(err.response ? `Ошибка ${err.response.status}: ${err.response.statusText}` : `Ошибка: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/Brands`);
                setBrands(response.data || []);
            } catch (error) {
                setError("Ошибка загрузки марок");
                setBrands([]);
            }
        };
        fetchBrands();
    }, []);

    useEffect(() => {
        const fetchModels = async () => {
            if (filters.brand?.brandId) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/Models/ByBrand/${filters.brand.brandId}`);
                    setModels(response.data || []);
                } catch (error) {
                    setError("Ошибка загрузки моделей");
                    setModels([]);
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
            if (filters.model?.modelId) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/Generations/ByModel/${filters.model.modelId}`);
                    setGenerations(response.data || []);
                } catch (error) {
                    setError("Ошибка загрузки поколений");
                    setGenerations([]);
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
            if (filters.generation?.generationId) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/BodyTypes/ByGeneration/${filters.generation.generationId}`);
                    setBodyTypes(response.data || []);
                } catch (error) {
                    setError("Ошибка загрузки типов кузова");
                    setBodyTypes([]);
                }
            } else {
                setBodyTypes([]);
            }
        };
        fetchBodyTypes();
    }, [filters.generation]);

    useEffect(() => {
        const fetchParameters = async () => {
            if (filters.category === "all") {
                setParametersData([]);
                setParameterOptions({});
                setIsParametersLoading(false);
                return;
            }
            setIsParametersLoading(true);
            try {
                let paramsUrl = null;
                if (filters.category === "autoboxes") {
                    paramsUrl = `${API_BASE_URL}/AutoboxParameters`;
                } else if (filters.category === "roof_racks") {
                    paramsUrl = `${API_BASE_URL}/RoofRackParameters`;
                } else if (filters.category === "parts_accessories") {
                    paramsUrl = `${API_BASE_URL}/SparePartsParameters`;
                }
                if (!paramsUrl) {
                    setParametersData([]);
                    setParameterOptions({});
                    return;
                }
                const response = await axios.get(paramsUrl);
                const data = Array.isArray(response.data) ? response.data : [];
                setParametersData(data);
                updateParameterOptions(data, filters.categoryParams);
            } catch (error) {
                setError("Ошибка загрузки параметров");
                setParametersData([]);
                setParameterOptions({});
            } finally {
                setIsParametersLoading(false);
            }
        };
        fetchParameters();
    }, [filters.category]);

    useEffect(() => {
        if (parametersData.length > 0) {
            updateParameterOptions(parametersData, filters.categoryParams);
        }
    }, [filters.categoryParams, parametersData]);

    const fetchParts = async () => {
        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsPartsLoading(true);
            const { category, brand, model, generation, bodyType, categoryParams } = filters;

            const params = {};

            if (brand?.brandId) params.brandId = brand.brandId;
            if (model?.modelId) params.modelId = model.modelId;
            if (generation?.generationId) params.generationId = generation.generationId;
            if (bodyType?.bodyTypeId) params.bodyTypeId = bodyType.bodyTypeId;

            Object.entries(categoryParams).forEach(([key, value]) => {
                if (value) params[key] = value;
            });

            const response = await axios.get(`${API_BASE_URL}/Parts/ByCategory/${category}`, {
                params,
                signal: controller.signal
            });

            setParts(response.data || []);
            setFilteredParts(response.data || []);
            setCurrentPage(1);
        } catch (error) {
            if (axios.isCancel(error)) {
            } else if (error.response && error.response.status === 404) {
                setParts([]);
                setFilteredParts([]);
                setError(null);
                setCurrentPage(1);
            } else {
                setError("Ошибка загрузки товаров");
                setParts([]);
                setFilteredParts([]);
            }
        } finally {
            setIsPartsLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, [
        filters.category,
        filters.brand,
        filters.model,
        filters.generation,
        filters.bodyType,
        filters.categoryParams
    ]);

    useEffect(() => {
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        priceTimeoutRef.current = setTimeout(() => {
            const { priceFrom, priceTo } = filters;
            const from = parseFloat(priceFrom) || 0;
            const to = parseFloat(priceTo) || Infinity;

            let filtered = parts.filter((item) => {
                const price = parseFloat(item.price) || 0;
                return price >= from && price <= to;
            });

            if (sortOrder) {
                filtered = [...filtered].sort((a, b) => {
                    const priceA = parseFloat(a.price) || 0;
                    const priceB = parseFloat(b.price) || 0;
                    return sortOrder === "по возрастанию" ? priceA - priceB : priceB - priceA;
                });
            }

            setFilteredParts(filtered);
            setCurrentPage(1);
        }, 500);

        return () => {
            if (priceTimeoutRef.current) {
                clearTimeout(priceTimeoutRef.current);
            }
        };
    }, [filters.priceFrom, filters.priceTo, parts, sortOrder]);

    const updateParameterOptions = (data, currentFilters) => {
        if (!Array.isArray(data) || !data.length) {
            setParameterOptions({});
            return;
        }

        const filteredData = data.filter((item) =>
            Object.entries(currentFilters).every(([key, value]) => !value || item[key]?.toString() === value.toString())
        );

        const allOptions = {
            dimensionsMm: [...new Set(data.map((item) => item.dimensionsMm?.toString()).filter(Boolean))].sort(),
            lengthCm: [...new Set(data.map((item) => item.lengthCm?.toString()).filter(Boolean))].sort(),
            loadKg: [...new Set(data.map((item) => item.loadKg?.toString()).filter(Boolean))].sort(),
            volumeL: [...new Set(data.map((item) => item.volumeL?.toString()).filter(Boolean))].sort(),
            openingSystem: [...new Set(data.map((item) => item.openingSystem?.toString()).filter(Boolean))].sort(),
            color: [...new Set(data.map((item) => item.color?.toString()).filter(Boolean))].sort(),
            countryOfOrigin: [...new Set(data.map((item) => item.countryOfOrigin?.toString()).filter(Boolean))].sort(),
            material: [...new Set(data.map((item) => item.material?.toString()).filter(Boolean))].sort(),
            mountingType: [...new Set(data.map((item) => item.mountingType?.toString()).filter(Boolean))].sort(),
            crossbarShape: [...new Set(data.map((item) => item.crossbarShape?.toString()).filter(Boolean))].sort(),
        };

        const validOptions = {
            dimensionsMm: [...new Set(filteredData.map((item) => item.dimensionsMm?.toString()).filter(Boolean))].sort(),
            lengthCm: [...new Set(filteredData.map((item) => item.lengthCm?.toString()).filter(Boolean))].sort(),
            loadKg: [...new Set(filteredData.map((item) => item.loadKg?.toString()).filter(Boolean))].sort(),
            volumeL: [...new Set(filteredData.map((item) => item.volumeL?.toString()).filter(Boolean))].sort(),
            openingSystem: [...new Set(filteredData.map((item) => item.openingSystem?.toString()).filter(Boolean))].sort(),
            color: [...new Set(filteredData.map((item) => item.color?.toString()).filter(Boolean))].sort(),
            countryOfOrigin: [...new Set(filteredData.map((item) => item.countryOfOrigin?.toString()).filter(Boolean))].sort(),
            material: [...new Set(filteredData.map((item) => item.material?.toString()).filter(Boolean))].sort(),
            mountingType: [...new Set(filteredData.map((item) => item.mountingType?.toString()).filter(Boolean))].sort(),
            crossbarShape: [...new Set(filteredData.map((item) => item.crossbarShape?.toString()).filter(Boolean))].sort(),
        };

        const newParameterOptions = Object.keys(allOptions).reduce((acc, key) => ({
            ...acc,
            [key]: allOptions[key].map((value) => ({
                value,
                isValid: validOptions[key].includes(value),
            })),
        }), {});

        setParameterOptions(newParameterOptions);
    };

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

    const handleCategoryParamChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            categoryParams: { ...prev.categoryParams, [key]: value || "" },
        }));
    };

    const handlePriceChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleCategoryChange = (category) => {
        const categoryValue = validCategories.includes(category) ? category : "all";
        setFilters((prev) => ({
            ...prev,
            category: categoryValue,
            brand: null,
            model: null,
            generation: null,
            bodyType: null,
            categoryParams: {},
            priceFrom: "",
            priceTo: "",
        }));
        setModels([]);
        setGenerations([]);
        setBodyTypes([]);
        setParametersData([]);
        setParameterOptions({});
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setFilters((prev) => ({
            ...prev,
            brand: null,
            model: null,
            generation: null,
            bodyType: null,
            categoryParams: {},
            priceFrom: "",
            priceTo: "",
        }));
        setSortOrder("");
        setModels([]);
        setGenerations([]);
        setBodyTypes([]);
        setCurrentPage(1);
    };

    const renderCategoryFilters = () => {
        if (filters.category === "all") return null;
        if (isParametersLoading) return <div>Загрузка фильтров...</div>;

        const params = parameterOptions || {};

        const createDropdown = (label, key, enableRange = false) => {
            const sortedOptions = (params[key] || []).sort((a, b) => {
                if (a.isValid && !b.isValid) return -1;
                if (!a.isValid && b.isValid) return 1;
                return a.value.localeCompare(b.value);
            });

            return (
                <DropdownFilter
                    key={key}
                    label={label}
                    options={sortedOptions.map(opt => ({
                        ...opt,
                        isDisabled: !opt.isValid,
                    }))}
                    selected={filters.categoryParams[key] || ""}
                    onChange={(value) => handleCategoryParamChange(key, value)}
                    getOptionLabel={(opt) => opt.value}
                    enableRange={enableRange}
                />
            );
        };

        switch (filters.category) {
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentParts = filteredParts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredParts.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const delta = 2;
        const left = currentPage - delta;
        const right = currentPage + delta;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                pages.push(i);
            } else if (i === left - 1 || i === right + 1) {
                pages.push("...");
            }
        }

        return (
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>

                {pages.map((page, index) => (
                    page === "..." ? (
                        <span key={index} className="ellipsis">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? "active" : ""}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>
            </div>
        );
    };

    const navigate = useNavigate();

    const handleProductClick = (partId) => {
        navigate(`/product/${partId}`);
    };

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="catalog-container">
            <aside className="filters">
                <label>Фильтры</label>
                <DropdownFilter
                    label="Категория"
                    options={categories}
                    selected={categories.find((cat) => cat.value === filters.category) || null}
                    onChange={handleCategoryChange}
                    getOptionLabel={(option) => option.label}
                />
                <DropdownFilter
                    label="Марка авто"
                    options={brands}
                    selected={filters.brand || null}
                    onChange={(value) => handleFilterChange("brand", value)}
                    getOptionLabel={(option) => option.name}
                />
                {filters.brand && (
                    <DropdownFilter
                        label="Модель"
                        options={models}
                        selected={filters.model || null}
                        onChange={(value) => handleFilterChange("model", value)}
                        getOptionLabel={(option) => option.name}
                    />
                )}
                {filters.model && (
                    <DropdownFilter
                        label="Поколение"
                        options={generations}
                        selected={filters.generation || null}
                        onChange={(value) => handleFilterChange("generation", value)}
                        getOptionLabel={(option) => option.year}
                    />
                )}
                {filters.generation && (
                    <DropdownFilter
                        label="Тип кузова"
                        options={bodyTypes}
                        selected={filters.bodyType || null}
                        onChange={(value) => handleFilterChange("bodyType", value)}
                        getOptionLabel={(option) => option.bodyTypeName}
                    />
                )}
                {renderCategoryFilters()}
                <div className="price-filter">
                    <label>Цена</label>
                    <div className="price-input-container">
                        <input
                            type="number"
                            name="priceFrom"
                            value={filters.priceFrom}
                            onChange={(e) => handlePriceChange("priceFrom", e.target.value)}
                            placeholder="От"
                            className="price-input"
                            min="0"
                        />
                        <input
                            type="number"
                            name="priceTo"
                            value={filters.priceTo}
                            onChange={(e) => handlePriceChange("priceTo", e.target.value)}
                            placeholder="До"
                            className="price-input"
                            min="0"
                        />
                    </div>
                    <DropdownFilter
                        label="Сортировка"
                        options={[
                            { value: "", label: "Без сортировки" },
                            { value: "по возрастанию", label: "Цена: по возрастанию" },
                            { value: "по убыванию", label: "Цена: по убыванию" },
                        ]}
                        selected={sortOrder}
                        onChange={(value) => setSortOrder(value)}
                        getOptionLabel={(option) => option.label}
                    />
                </div>
                <button className="reset-filters-button" onClick={resetFilters}>
                    Сбросить фильтры
                </button>
            </aside>
            <main className="catalog-items">
                <h1>{categoryName}</h1>
                {isPartsLoading ? (
                    <div className="loading-indicator">Загрузка товаров...</div>
                ) : filteredParts.length === 0 ? (
                    <p>Нет товаров, соответствующих выбранным фильтрам.</p>
                ) : (
                    <>
                        <ProductList
                            products={currentParts}
                            categoryName={categoryName}
                            onProductClick={handleProductClick}
                            isAdmin={isAdmin}
                        />
                        {renderPagination()}
                    </>
                )}
            </main>
        </div>
    );
};

export default AutoParts;