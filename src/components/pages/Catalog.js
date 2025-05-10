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
    const [priceRange, setPriceRange] = useState({ priceFrom: "", priceTo: "" });
    const [resetFiltersTrigger, setResetFiltersTrigger] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const categoryMap = {
        autoboxes: "Автобоксы",
        roof_racks: "Багажники",
        parts_accessories: "Запчасти и аксессуары",
    };
    const categoryName = categoryMap[category] || "Категория не найдена";

    // Получаем данные о пользователе и проверяем его статус (админ или нет)
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (!token) {
                setIsAdmin(false); // Нет токена — не админ
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

                // Если полученные данные содержат статус администратора, проверяем его
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
                    setProducts(data);
                }
            } catch (error) {
                console.error("Ошибка загрузки параметров:", error);
                setError("Ошибка загрузки параметров");
            }
        };

        fetchParameters();
    }, [category]);

    const fetchFilteredProducts = async () => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const url = `${API_BASE_URL}/Parts/ByCategory/${category}?${queryParams}`;
            const response = await axios.get(url);

            const filteredByPrice = response.data.filter((product) => {
                const price = product.price;
                const from = parseFloat(priceRange.priceFrom) || 0;
                const to = parseFloat(priceRange.priceTo) || Infinity;
                return price >= from && price <= to;
            });

            setFilteredProducts(filteredByPrice);
        } catch (error) {
            console.error("Ошибка загрузки продуктов:", error);
            setError("Ошибка загрузки продуктов");
        }
    };

    useEffect(() => {
        fetchFilteredProducts();
    }, [filters, priceRange]);

    const resetFilters = () => {
        setFilters({});
        setPriceRange({ priceFrom: "", priceTo: "" });
        setResetFiltersTrigger((prev) => !prev);
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
                getOptionLabel={(opt) => opt}
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
                    products={filteredProducts}
                    categoryName={categoryName}
                    onProductClick={handleProductClick}
                    isAdmin={isAdmin}
                />
            </main>
        </div>
    );
};

export default Catalog;