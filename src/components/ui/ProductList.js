import React from "react";
import { useNavigate } from "react-router-dom";
import AddToCartButton from "../ui/AddToCartButton";

const ProductList = ({ products, categoryName, isAdmin }) => {
    const navigate = useNavigate();

    // Переход на страницу продукта
    const handleProductClick = (partId) => {
        navigate(`/product/${partId}`);
    };

    // Переход на страницу редактирования
    const handleEditClick = (partId) => {
        navigate(`/edit-part/${partId}`);
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
        </div>
    );
};

export default ProductList;