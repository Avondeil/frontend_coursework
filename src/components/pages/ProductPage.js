import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useParams } from 'react-router-dom';
import '../styles/ProductPage.css';
import AddToCartButton from "../ui/AddToCartButton";

const ProductPage = () => {
    const { partId } = useParams(); // Получаем partId из URL
    const [product, setProduct] = useState(null);
    const [productDetails, setProductDetails] = useState(null);
    const [productType, setProductType] = useState(""); // Переменная для хранения типа товара
    const [detailsError, setDetailsError] = useState(false); // Ошибка для характеристик
    const [productError, setProductError] = useState(false); // Ошибка для отсутствующего товара
    const navigate = useNavigate();

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

    if (productError) {
        return <div className="error-container">Товар не существует или был удален.</div>;
    }

    if (!product) {
        return <div className="error-container">Загрузка...</div>;
    }

    const goBack = () => {
        navigate(-1);
    };

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
                        <p className="product-stock">В наличии: {product.stockQuantity} шт.</p>
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

                <div className="product-description-section">
                    <h3>Описание</h3>
                    <p>{product.description}</p>
                </div>
            </div>

            <div className="action-buttons">
                {product.stockQuantity > 0 ? (
                    <AddToCartButton product={product} className="buy-button"/>
                ) : (
                    <p className="out-of-stock">Нет в наличии</p>
                )}
                <button className="back-to-list-btn" onClick={goBack}>Назад</button>
            </div>
        </div>
    );
}

export default ProductPage;
