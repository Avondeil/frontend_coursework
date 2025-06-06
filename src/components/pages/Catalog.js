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
    const [parametersData, setParametersData] = useState([]);
    const [parameterOptions, setParameterOptions] = useState({});
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [priceRange, setPriceRange] = useState({ priceFrom: "", priceTo: "" });
    const [resetFiltersTrigger, setResetFiltersTrigger] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const categoryMap = {
        autoboxes: "Автобоксы",
        roof_racks: "Багажники",
        parts_accessories: "Запчасти и аксессуары",
    };
    const categoryName = categoryMap[category] || "Категория не найдена";

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

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
                }
            } catch (err) {
                if (err.response) {
                    if (err.response.status === 401) {
                        setError("Ошибка 401: Неавторизован. Проверьте токен.");
                    } else if (err.response.status === 404) {
                        setError("Ошибка 404: Пользователь не найден.");
                    } else {
                        setError(`Ошибка сервера: ${err.response.statusText}`);
                    }
                } else {
                    setError(`Ошибка при выполнении запроса: ${err.message}`);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Загрузка параметров для фильтров
                let paramsUrl = "";
                if (category === "autoboxes") {
                    paramsUrl = `${API_BASE_URL}/AutoboxParameters`;
                } else if (category === "roof_racks") {
                    paramsUrl = `${API_BASE_URL}/RoofRackParameters`;
                } else if (category === "parts_accessories") {
                    paramsUrl = `${API_BASE_URL}/SparePartsParameters`;
                }

                let parametersData = [];
                if (paramsUrl) {
                    const paramsResponse = await axios.get(paramsUrl);
                    parametersData = paramsResponse.data;
                    setParametersData(parametersData); // Сохраняем данные параметров
                    updateParameterOptions(parametersData, {});
                }

                // Загрузка продуктов для отображения
                const productsUrl = `${API_BASE_URL}/Parts/ByCategory/${category}`;
                const productsResponse = await axios.get(productsUrl);
                const productsData = productsResponse.data;
                setProducts(productsData);
                setFilteredProducts(productsData);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
                setError("Ошибка загрузки данных");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [category]);

    const updateParameterOptions = (data, currentFilters) => {
        const filteredData = data.filter((item) => {
            return Object.entries(currentFilters).every(([key, value]) => {
                if (!value) return true;
                return item[key]?.toString() === value.toString();
            });
        });

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

        setParameterOptions(
            Object.keys(allOptions).reduce((acc, key) => ({
                ...acc,
                [key]: allOptions[key].map((option) => ({
                    value: option,
                    isValid: validOptions[key].includes(option),
                })),
            }), {})
        );
    };

    const fetchFilteredProducts = async () => {
        try {
            // Исключаем параметры со значением null или undefined
            const validFilters = Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value != null && value !== "")
            );
            const queryParams = new URLSearchParams(validFilters).toString();
            const url = `${API_BASE_URL}/Parts/ByCategory/${category}${queryParams ? `?${queryParams}` : ""}`;
            const response = await axios.get(url);

            const filteredByPrice = response.data.filter((product) => {
                const price = product.price;
                const from = parseFloat(priceRange.priceFrom) || 0;
                const to = parseFloat(priceRange.priceTo) || Infinity;
                return price >= from && price <= to;
            });

            setFilteredProducts(filteredByPrice);
            updateParameterOptions(parametersData, validFilters);
            setCurrentPage(1);
        } catch (error) {
            console.error("Ошибка загрузки продуктов:", error);
            setError("Ошибка загрузки продуктов");
        }
    };

    useEffect(() => {
        if (Object.keys(filters).length > 0 || priceRange.priceFrom || priceRange.priceTo) {
            fetchFilteredProducts();
        } else {
            const fetchInitialProducts = async () => {
                try {
                    const url = `${API_BASE_URL}/Parts/ByCategory/${category}`;
                    const response = await axios.get(url);
                    setFilteredProducts(response.data);
                    updateParameterOptions(parametersData, {}); // Обновляем опции при сбросе фильтров
                } catch (error) {
                    console.error("Ошибка загрузки продуктов:", error);
                    setError("Ошибка загрузки продуктов");
                }
            };
            fetchInitialProducts();
        }
    }, [filters, priceRange, products, parametersData]);

    const resetFilters = () => {
        setFilters({});
        setPriceRange({ priceFrom: "", priceTo: "" });
        setResetFiltersTrigger((prev) => !prev);
        setCurrentPage(1);
    };

    const renderFiltersByCategory = () => {
        const params = parameterOptions;

        const createDropdown = (label, key, enableRange = false) => (
            <DropdownFilter
                key={key}
                label={label}
                options={params[key] || []}
                selected={filters[key]}
                onChange={(value) => setFilters((prev) => ({ ...prev, [key]: value }))}
                getOptionLabel={(opt) => opt.value}
                enableRange={enableRange}
                reset={resetFiltersTrigger}
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

    const handleProductClick = (partId) => {
        navigate(`/product/${partId}`);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPagination = () => {
        const pages = [];
        const delta = 2;

        pages.push(1);
        if (currentPage - delta > 2) pages.push('...');
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            pages.push(i);
        }
        if (currentPage + delta < totalPages - 1) pages.push('...');
        if (totalPages > 1) pages.push(totalPages);

        return pages.map((page, index) =>
            page === '...' ? (
                <span key={index}>...</span>
            ) : (
                <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={currentPage === page ? 'active' : ''}
                >
                    {page}
                </button>
            )
        );
    };

    if (isLoading) return <div>Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="catalog-container">
            <div className="filters">
                <label>Фильтры</label>
                {renderFiltersByCategory()}
                <div className="price-filter">
                    <label>Цена</label>
                    <input
                        type="number"
                        name="priceFrom"
                        value={priceRange.priceFrom}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, priceFrom: e.target.value }))}
                        placeholder="От"
                        className="dropdown-search"
                        min="0"
                    />
                    <input
                        type="number"
                        name="priceTo"
                        value={priceRange.priceTo}
                        onChange={(e) => setPriceRange((prev) => ({ ...prev, priceTo: e.target.value }))}
                        placeholder="До"
                        className="dropdown-search"
                        min="0"
                    />
                </div>
                <button className="reset-filters-button" onClick={resetFilters}>
                    Сбросить фильтры
                </button>
            </div>

            <main className="catalog-items">
                <h1>{categoryName}</h1>
                <ProductList
                    products={currentProducts}
                    categoryName={categoryName}
                    onProductClick={handleProductClick}
                    isAdmin={isAdmin}
                />
                {totalPages > 1 && (
                    <div className="pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            &lt;
                        </button>
                        {renderPagination()}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            &gt;
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Catalog;