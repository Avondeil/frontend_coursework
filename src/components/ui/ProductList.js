import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "../ui/AddToCartButton";

const ProductList = ({ products, categoryName, isAdmin }) => {
    const navigate = useNavigate();
    const [comparisonItems, setComparisonItems] = useState([]);

    // Загрузка выбранных товаров из localStorage при монтировании
    useEffect(() => {
        const storedItems = JSON.parse(localStorage.getItem("comparisonItems")) || [];
        setComparisonItems(storedItems);
    }, []);

    // Сохранение в localStorage при изменении списка сравнения
    useEffect(() => {
        localStorage.setItem("comparisonItems", JSON.stringify(comparisonItems));
    }, [comparisonItems]);

    // Обработка изменения состояния чекбокса
    const handleComparisonChange = (partId, checked) => {
        const product = products.find((p) => p.partId === partId);
        const categoryMatch = comparisonItems.length === 0 ||
            products.find((p) => p.partId === comparisonItems[0]).productTypeId === product.productTypeId;

        if (!categoryMatch) {
            alert("Можно сравнивать только товары из одной категории!");
            return;
        }

        if (checked) {
            setComparisonItems((prev) => [...prev, partId]);
        } else {
            setComparisonItems((prev) => prev.filter((id) => id !== partId));
        }
    };

    // Проверка возможности сравнения
    const canCompare = comparisonItems.length >= 2;

    // Переход на страницу продукта
    const handleProductClick = (partId) => {
        navigate(`/product/${partId}`);
    };

    // Переход на страницу редактирования
    const handleEditClick = (partId) => {
        navigate(`/edit-part/${partId}`);
    };

    // Переход на страницу сравнения
    const handleCompareClick = () => {
        navigate("/compare");
    };

    return (
        <div className="items-grid">
            {products.length > 0 ? (
                products.map((product) => (
                    <div key={product.partId} className="product-card">
                        <img
                            src={product.imageUrl || "https://via.placeholder.com/300"}
                            alt={product.name || "Товар"}
                            className="product-image"
                        />
                        <div className="product-info">
                            <h2 className="product-title" onClick={() => handleProductClick(product.partId)}>
                                {product.name || "Без названия"}
                            </h2>
                            <p className="product-type">
                                {categoryName || (
                                    product.productTypeId === 1
                                        ? "Автобоксы"
                                        : product.productTypeId === 2
                                            ? "Багажники"
                                            : product.productTypeId === 3
                                                ? "Запчасти и аксессуары"
                                                : "Неизвестная категория"
                                )}
                            </p>
                            <div className="product-bottom">
                                <span className="product-price">{product.price} ₽</span>
                                <div className="comparison-checkbox">
                                    <label className="comparison-label">Добавить в сравнение</label>
                                    <input
                                        type="checkbox"
                                        className="comparison-input"
                                        checked={comparisonItems.includes(product.partId)}
                                        onChange={(e) => handleComparisonChange(product.partId, e.target.checked)}
                                    />
                                </div>
                                <div className="product-actions">
                                    {product.stockQuantity <= 0 && (
                                        <span className="out-of-stock">Нет в наличии</span>
                                    )}
                                    {isAdmin ? (
                                        <button
                                            className="buy-button"
                                            onClick={() => handleEditClick(product.partId)}
                                        >
                                            Редактировать
                                        </button>
                                    ) : product.stockQuantity > 0 ? (
                                        <AddToCartButton className="buy-button" product={product} />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>Нет товаров для отображения</p>
            )}
            {canCompare && (
                <button className="compare-button" onClick={handleCompareClick}>
                    Сравнить ({comparisonItems.length})
                </button>
            )}
        </div>
    );
};

export default ProductList;