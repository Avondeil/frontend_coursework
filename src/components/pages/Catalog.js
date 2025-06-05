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
            setCurrentPage(1);
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