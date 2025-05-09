import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config';
import '../styles/PartForm.css';

const PartForm = ({ partId, onSave }) => {
    const [part, setPart] = useState({
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        productTypeId: null,
        imageUrl: '',
        autoboxParameter: { dimensionsMm: '', loadKg: null, volumeL: null, openingSystem: '', countryOfOrigin: '', color: '' },
        roofRackParameter: { lengthCm: null, material: '', loadKg: null, mountingType: '', crossbarShape: '', countryOfOrigin: '', color: '' },
        sparePartsParameter: { countryOfOrigin: '', color: '' },
        compatibilities: []
    });

    const productTypes = [
        { productTypeId: 1, name: 'Автобоксы' },
        { productTypeId: 2, name: 'Багажники' },
        { productTypeId: 3, name: 'Запчасти и аксессуары' }
    ];

    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [generations, setGenerations] = useState([]);
    const [bodyTypes, setBodyTypes] = useState([]);
    const [compatibility, setCompatibility] = useState({ brandId: null, modelId: null, generationId: null, bodytypeid: null });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) throw new Error('Токен авторизации не найден');
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const brandsRes = await axios.get(`${API_BASE_URL}/Brands`, config);
                setBrands(brandsRes.data || []);

                if (partId) {
                    const partRes = await axios.get(`${API_BASE_URL}/parts/${partId}`, config);
                    const partData = partRes.data;
                    setPart({
                        name: partData.name || '',
                        description: partData.description || '',
                        price: partData.price || 0,
                        stockQuantity: partData.stockQuantity || 0,
                        productTypeId: partData.productTypeId || null,
                        imageUrl: partData.imageUrl || '',
                        autoboxParameter: partData.productTypeId === 1 ? partData.autoboxParameter : { dimensionsMm: '', loadKg: null, volumeL: null, openingSystem: '', countryOfOrigin: '', color: '' },
                        roofRackParameter: partData.productTypeId === 2 ? partData.roofRackParameter : { lengthCm: null, material: '', loadKg: null, mountingType: '', crossbarShape: '', countryOfOrigin: '', color: '' },
                        sparePartsParameter: partData.productTypeId === 3 ? partData.sparePartsParameter : { countryOfOrigin: '', color: '' },
                        compatibilities: partData.partsAutos?.map(c => ({
                            brandId: c.brandId,
                            modelId: c.modelId,
                            generationId: c.generationId,
                            bodytypeid: c.bodytypeId,
                            brandName: brandsRes.data.find(b => b.brandId === c.brandId)?.name || 'Неизвестный бренд',
                            modelName: 'Неизвестная модель',
                            generationYear: 'Неизвестное поколение',
                            bodyTypeName: 'Неизвестный тип кузова'
                        })) || []
                    });
                }
            } catch (error) {
                const message = error.response?.data?.message || error.message;
                setError(`Ошибка загрузки данных: ${message}`);
                toast.error(`Ошибка загрузки данных: ${message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [partId]);

    useEffect(() => {
        if (compatibility.brandId) {
            const fetchModels = async () => {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const response = await axios.get(`${API_BASE_URL}/Models/ByBrand/${compatibility.brandId}`, config);
                    setModels(response.data || []);
                    setCompatibility(prev => ({ ...prev, modelId: null, generationId: null, bodytypeid: null }));
                    setGenerations([]);
                    setBodyTypes([]);
                } catch (error) {
                    toast.error(`Ошибка загрузки моделей: ${error.message}`);
                }
            };
            fetchModels();
        } else {
            setModels([]);
            setGenerations([]);
            setBodyTypes([]);
            setCompatibility(prev => ({ ...prev, modelId: null, generationId: null, bodytypeid: null }));
        }
    }, [compatibility.brandId]);

    useEffect(() => {
        if (compatibility.modelId) {
            const fetchGenerations = async () => {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const response = await axios.get(`${API_BASE_URL}/Generations/ByModel/${compatibility.modelId}`, config);
                    setGenerations(response.data || []);
                    setCompatibility(prev => ({ ...prev, generationId: null, bodytypeid: null }));
                    setBodyTypes([]);
                } catch (error) {
                    toast.error(`Ошибка загрузки поколений: ${error.message}`);
                }
            };
            fetchGenerations();
        } else {
            setGenerations([]);
            setBodyTypes([]);
            setCompatibility(prev => ({ ...prev, generationId: null, bodytypeid: null }));
        }
    }, [compatibility.modelId]);

    useEffect(() => {
        if (compatibility.generationId) {
            const fetchBodyTypes = async () => {
                try {
                    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const response = await axios.get(`${API_BASE_URL}/BodyTypes/ByGeneration/${compatibility.generationId}`, config);
                    setBodyTypes(response.data || []);
                    setCompatibility(prev => ({ ...prev, bodytypeid: null }));
                } catch (error) {
                    toast.error(`Ошибка загрузки типов кузова: ${error.message}`);
                }
            };
            fetchBodyTypes();
        } else {
            setBodyTypes([]);
            setCompatibility(prev => ({ ...prev, bodytypeid: null }));
        }
    }, [compatibility.generationId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const [field, subField] = name.split('.');
        if (subField) {
            setPart(prev => ({
                ...prev,
                [field]: { ...prev[field], [subField]: value }
            }));
        } else {
            const numericFields = ['price', 'stockQuantity', 'productTypeId'];
            setPart(prev => ({
                ...prev,
                [name]: numericFields.includes(name) ? (value ? Number(value) : null) : value
            }));
        }
    };

    const handleCompatibilityChange = (e) => {
        const { name, value } = e.target;
        setCompatibility(prev => ({ ...prev, [name]: value ? Number(value) : null }));
    };

    const addCompatibility = () => {
        if (compatibility.brandId && compatibility.modelId && compatibility.generationId && compatibility.bodytypeid) {
            const brand = brands.find(b => b.brandId === compatibility.brandId);
            const model = models.find(m => m.modelId === compatibility.modelId);
            const generation = generations.find(g => g.generationId === compatibility.generationId);
            const bodyType = bodyTypes.find(bt => bt.bodytypeid === compatibility.bodytypeid);

            const newCompatibility = {
                brandId: compatibility.brandId,
                brandName: brand?.name || 'Неизвестный бренд',
                modelId: compatibility.modelId,
                modelName: model?.name || 'Неизвестная модель',
                generationId: compatibility.generationId,
                generationYear: generation?.year || 'Неизвестное поколение',
                bodytypeid: compatibility.bodytypeid,
                bodyTypeName: bodyType?.bodyTypeName || 'Неизвестный тип кузова'
            };

            setPart(prev => ({
                ...prev,
                compatibilities: [...prev.compatibilities, newCompatibility]
            }));
            setCompatibility({ brandId: null, modelId: null, generationId: null, bodytypeid: null });
            setModels([]);
            setGenerations([]);
            setBodyTypes([]);
        } else {
            toast.error('Заполните все поля совместимости');
        }
    };

    const removeCompatibility = (index) => {
        setPart(prev => ({
            ...prev,
            compatibilities: prev.compatibilities.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!part.name || part.price <= 0 || !part.productTypeId) {
            toast.error('Заполните обязательные поля: название, цена и тип продукции');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('Токен авторизации не найден');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const partData = {
                name: part.name,
                description: part.description || null,
                price: part.price,
                stockQuantity: part.stockQuantity,
                productTypeId: part.productTypeId,
                imageUrl: part.imageUrl || null,
                compatibilities: part.compatibilities.map(c => ({
                    brandId: c.brandId,
                    modelId: c.modelId,
                    generationId: c.generationId,
                    bodytypeId: c.bodytypeid
                })),
                autoboxParameter: part.productTypeId === 1 ? part.autoboxParameter : null,
                roofRackParameter: part.productTypeId === 2 ? part.roofRackParameter : null,
                sparePartsParameter: part.productTypeId === 3 ? part.sparePartsParameter : null
            };

            if (partId) {
                partData.partId = partId;
                await axios.put(`${API_BASE_URL}/parts/${partId}`, partData, config);
                toast.success('Запчасть успешно обновлена');
            } else {
                await axios.post(`${API_BASE_URL}/parts`, partData, config);
                toast.success('Запчасть успешно добавлена');
            }
            onSave();
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            setError(`Ошибка сохранения: ${message}`);
            toast.error(`Ошибка сохранения: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="form-container">Загрузка...</div>;
    if (error) return <div className="form-container text-danger">{error}</div>;

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2 className="form-title">{partId ? 'Редактировать запчасть' : 'Добавить запчасть'}</h2>

            <div className="form-group">
                <label className="form-label">Название *</label>
                <input type="text" name="name" value={part.name} onChange={handleChange} className="form-input" required />
            </div>

            <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea name="description" value={part.description} onChange={handleChange} className="form-textarea" />
            </div>

            <div className="form-group">
                <label className="form-label">Цена *</label>
                <input type="number" name="price" value={part.price} onChange={handleChange} className="form-input" required min="0.01" step="0.01" />
            </div>

            <div className="form-group">
                <label className="form-label">Количество на складе</label>
                <input type="number" name="stockQuantity" value={part.stockQuantity} onChange={handleChange} className="form-input" min="0" />
            </div>

            <div className="form-group">
                <label className="form-label">Тип продукции *</label>
                <select name="productTypeId" value={part.productTypeId || ''} onChange={handleChange} className="form-select" required>
                    <option value="">Выберите тип</option>
                    {productTypes.map(type => (
                        <option key={type.productTypeId} value={type.productTypeId}>{type.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">URL изображения</label>
                <input type="text" name="imageUrl" value={part.imageUrl} onChange={handleChange} className="form-input" />
            </div>

            {part.productTypeId === 1 && (
                <>
                    <div className="form-group">
                        <label className="form-label">Размеры (мм)</label>
                        <input type="text" name="autoboxParameter.dimensionsMm" value={part.autoboxParameter.dimensionsMm} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Максимальная нагрузка (кг)</label>
                        <input type="number" name="autoboxParameter.loadKg" value={part.autoboxParameter.loadKg || ''} onChange={handleChange} className="form-input" min="0" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Объем (л)</label>
                        <input type="number" name="autoboxParameter.volumeL" value={part.autoboxParameter.volumeL || ''} onChange={handleChange} className="form-input" min="0" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Система открывания</label>
                        <input type="text" name="autoboxParameter.openingSystem" value={part.autoboxParameter.openingSystem} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Страна происхождения</label>
                        <input type="text" name="autoboxParameter.countryOfOrigin" value={part.autoboxParameter.countryOfOrigin} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Цвет</label>
                        <input type="text" name="autoboxParameter.color" value={part.autoboxParameter.color} onChange={handleChange} className="form-input" />
                    </div>
                </>
            )}

            {part.productTypeId === 2 && (
                <>
                    <div className="form-group">
                        <label className="form-label">Длина (см)</label>
                        <input type="number" name="roofRackParameter.lengthCm" value={part.roofRackParameter.lengthCm || ''} onChange={handleChange} className="form-input" min="0" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Материал</label>
                        <input type="text" name="roofRackParameter.material" value={part.roofRackParameter.material} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Максимальная нагрузка (кг)</label>
                        <input type="number" name="roofRackParameter.loadKg" value={part.roofRackParameter.loadKg || ''} onChange={handleChange} className="form-input" min="0" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Тип крепления</label>
                        <input type="text" name="roofRackParameter.mountingType" value={part.roofRackParameter.mountingType} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Форма поперечин</label>
                        <input type="text" name="roofRackParameter.crossbarShape" value={part.roofRackParameter.crossbarShape} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Страна происхождения</label>
                        <input type="text" name="roofRackParameter.countryOfOrigin" value={part.roofRackParameter.countryOfOrigin} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Цвет</label>
                        <input type="text" name="roofRackParameter.color" value={part.roofRackParameter.color} onChange={handleChange} className="form-input" />
                    </div>
                </>
            )}

            {part.productTypeId === 3 && (
                <>
                    <div className="form-group">
                        <label className="form-label">Страна происхождения</label>
                        <input type="text" name="sparePartsParameter.countryOfOrigin" value={part.sparePartsParameter.countryOfOrigin} onChange={handleChange} className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Цвет</label>
                        <input type="text" name="sparePartsParameter.color" value={part.sparePartsParameter.color} onChange={handleChange} className="form-input" />
                    </div>
                </>
            )}

            <div className="compatibility-section">
                <h3 className="compatibility-title">Совместимость с автомобилями</h3>
                <div className="compatibility-grid">
                    <div className="form-group">
                        <label className="form-label">Бренд</label>
                        <select name="brandId" value={compatibility.brandId || ''} onChange={handleCompatibilityChange} className="form-select">
                            <option value="">Выберите бренд</option>
                            {brands.map(brand => (
                                <option key={brand.brandId} value={brand.brandId}>{brand.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Модель</label>
                        <select name="modelId" value={compatibility.modelId || ''} onChange={handleCompatibilityChange} className="form-select" disabled={!compatibility.brandId || models.length === 0}>
                            <option value="">Выберите модель</option>
                            {models.map(model => (
                                <option key={model.modelId} value={model.modelId}>{model.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Поколение</label>
                        <select name="generationId" value={compatibility.generationId || ''} onChange={handleCompatibilityChange} className="form-select" disabled={!compatibility.modelId || generations.length === 0}>
                            <option value="">Выберите поколение</option>
                            {generations.map(gen => (
                                <option key={gen.generationId} value={gen.generationId}>{gen.year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Тип кузова</label>
                        <select name="bodytypeid" value={compatibility.bodytypeid || ''} onChange={handleCompatibilityChange} className="form-select" disabled={!compatibility.generationId || bodyTypes.length === 0}>
                            <option value="">Выберите тип кузова</option>
                            {bodyTypes.map(type => (
                                <option key={type.bodytypeid} value={type.bodytypeid}>{type.bodyTypeName}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button type="button" onClick={addCompatibility} className="btn btn-primary" disabled={isLoading}>
                    Добавить совместимость
                </button>
                <div className="compatibility-list">
                    {part.compatibilities.length > 0 ? (
                        part.compatibilities.map((compat, index) => (
                            <div key={index} className="compatibility-item">
                                <span>{compat.brandName} - {compat.modelName} - {compat.generationYear} - {compat.bodyTypeName}</span>
                                <button type="button" onClick={() => removeCompatibility(index)} className="btn btn-danger" disabled={isLoading}>
                                    Удалить
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>Совместимости не добавлены</p>
                    )}
                </div>
            </div>

            <button type="submit" className="submit-btn btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Сохранение...' : partId ? 'Сохранить изменения' : 'Добавить запчасть'}
            </button>
        </form>
    );
};

export default PartForm;