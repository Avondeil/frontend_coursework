import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import '../styles/ProductPage.css';
import AddToCartButton from "../ui/AddToCartButton";

const ProductPage = () => {
    // Получаем partId из URL
    const { partId } = useParams();
    const [product, setProduct] = useState(null);
    const [productDetails, setProductDetails] = useState(null);
    // Переменная для хранения типа товара
    const [productType, setProductType] = useState("");
    // Ошибка для характеристик
    const [detailsError, setDetailsError] = useState(false);
    // Ошибка для отсутствующего товара
    const [productError, setProductError] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

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
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        // Функция для получения характеристик товара в зависимости от типа
        const fetchProductDetails = async (type, id) => {
            try {
                let url = "";
                if (type === 1) {
                    url = `${API_BASE_URL}/AutoboxParameters/${id}`;
                } else if (type === 2) {
                    url = `${API_BASE_URL}/RoofRackParameters/${id}`;
                } else if (type === 3) {
                    url = `${API_BASE_URL}/SparePartsParameters/${id}`;
                }
                const response = await axios.get(url);
                setProductDetails(response.data);
            } catch (error) {
                console.error('Ошибка загрузки характеристик товара:', error);
                setDetailsError(true);
            }
        };

        // Основной запрос на получение информации о товаре
        axios.get(`${API_BASE_URL}/Parts/${partId}`)
            .then(response => {
                const productData = response.data;
                setProduct(productData);

                // Устанавливаем тип товара и загружаем характеристики
                if (productData.productTypeId === 1) {
                    setProductType("Автобокс");
                } else if (productData.productTypeId === 2) {
                    setProductType("Багажник");
                } else if (productData.productTypeId === 3) {
                    setProductType("Запчасти и аксессуары");
                }

                fetchProductDetails(productData.productTypeId, partId);
            })
            .catch(error => {
                console.error('Ошибка загрузки данных о товаре:', error);
                setProductError(true);
            });
    }, [partId]);

    if (isLoading) return <div className="error-container">Загрузка...</div>;
    if (productError) return <div className="error-container">Товар не существует или был удален.</div>;
    if (!product) return <div className="error-container">Загрузка...</div>;

    const goBack = () => {
        navigate(-1);
    };

    const handleEditClick = () => {
        navigate(`/edit-part/${partId}`);
    };

    // Определяем текст наличия
    const stockText = product.stockQuantity > 0 ? `В наличии: ${product.stockQuantity} шт.` : "Нет в наличии";

    return (
        <div className="product-page-container">
            <div className="product-header">
                <img
                    src={product.imageUrl || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="product-image"
                />
                <div className="product-info">
                    <h1 className="product-name">{product.name}</h1>
                    <p className="product-description">{productType}</p> {/* Отображаем тип товара */}
                    <div className="product-price-stock">
                        <p className="product-price">Цена: {product.price} руб.</p>
                        <p className="product-stock">{stockText}</p>
                    </div>
                </div>
            </div>

            <div className="product-details">
                <div className="product-info-section">
                    <h3>Характеристики</h3>
                    {detailsError || !productDetails ? (
                        <p>Характеристики не найдены.</p>
                    ) : (
                        <ul>
                            {product.productTypeId === 1 && (
                                <>
                                    <li><span>Размер:</span> {productDetails.dimensionsMm}</li>
                                    <li><span>Нагрузочный лимит:</span> {productDetails.loadKg} кг</li>
                                    <li><span>Объем:</span> {productDetails.volumeL} л</li>
                                    <li><span>Цвет:</span> {productDetails.color}</li>
                                    <li><span>Страна происхождения:</span> {productDetails.countryOfOrigin}</li>
                                    <li><span>Система открытия:</span> {productDetails.openingSystem}</li>
                                </>
                            )}
                            {product.productTypeId === 2 && (
                                <>
                                    <li><span>Длина:</span> {productDetails.lengthCm} см</li>
                                    <li><span>Материал:</span> {productDetails.material}</li>
                                    <li><span>Нагрузочный лимит:</span> {productDetails.loadKg} кг</li>
                                    <li><span>Тип крепления:</span> {productDetails.mountingType}</li>
                                    <li><span>Форма перекладины:</span> {productDetails.crossbarShape}</li>
                                    <li><span>Страна происхождения:</span> {productDetails.countryOfOrigin}</li>
                                    <li><span>Цвет:</span> {productDetails.color}</li>
                                </>
                            )}
                            {product.productTypeId === 3 && (
                                <>
                                    <li><span>Страна происхождения:</span> {productDetails.countryOfOrigin}</li>
                                    <li><span>Цвет:</span> {productDetails.color}</li>
                                </>
                            )}
                        </ul>
                    )}
                </div>

                <div className="product-compatibility-section">
                    <h3>Совместимость с автомобилями</h3>
                    {product.compatibilities && product.compatibilities.length > 0 ? (
                        <ul>
                            {product.compatibilities.map((comp, index) => (
                                <li key={index}>
                                    <span>{comp.brandName} {comp.modelName}</span> ({comp.generationYear}, {comp.bodytypeName})
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Совместимость не указана.</p>
                    )}
                </div>

                <div className="product-description-section">
                    <h3>Описание</h3>
                    <p>{product.description}</p>
                </div>
            </div>

            <div className="action-buttons">
                {isAdmin ? (
                    <button className="buy-button" onClick={handleEditClick}>
                        Редактировать
                    </button>
                ) : product.stockQuantity > 0 ? (
                    <AddToCartButton product={product} className="buy-button" />
                ) : (
                    <p className="out-of-stock">Нет в наличии</p>
                )}
                <button className="back-to-list-btn" onClick={goBack}>Назад</button>
            </div>
        </div>
    );
}

export default ProductPage;