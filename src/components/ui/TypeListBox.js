import React from "react";
import "../styles/TypeListBox.css"
import {useNavigate} from "react-router-dom";

const TypeListBox = () => {

    const navigate = useNavigate();

    const handleCategoryClick = (category) => {
        navigate(`/catalog/${category}`);
    };

    return (
        <div className="typeList-container">
            <h3 className="catalog-heading">Каталог товаров</h3>
            <p>Компания ЕКБДеталь производит БАГАЖНИКИ, АВТОБОКСЫ, ЗАПЧАСТИ и
                АКСЕССУАРЫ.</p>
            <p>Ниже предлагаем Вам ознакомиться с ассортиментом.</p>

            <div className="catalog-types">
                <div className="catalog-item" onClick={() => handleCategoryClick("autoboxes")}>
                    <img src="https://eurodetal.pro/upload/resize_cache/iblock/f92/500_500_140cd750bba9870f18aada2478b24840a/i2qoirk01b9zlq5shd7fsk1euuysi967.jpg" alt="Автобокс"/>
                    <h4>Автобоксы ЕКБДеталь</h4>
                    <p>10 товаров</p>
                    <p className="catalog-description">Автобоксы от ЕКБДеталь</p>
                </div>
                <div className="catalog-item" onClick={() => handleCategoryClick("roof_racks")}>
                    <img
                        src="https://eurodetal.pro/upload/resize_cache/iblock/ea5/500_500_140cd750bba9870f18aada2478b24840a/43ucy21lqz01bsage6x0m80igegg5fww.JPEG"
                        alt="Багажники"/>
                    <h4>Багажники ЕКБДеталь</h4>
                    <p>62 товара</p>
                    <p className="catalog-description">Багажники от ЕКБДеталь</p>
                </div>
                <div className="catalog-item" onClick={() => handleCategoryClick("parts_accessories")}>
                    <img
                        src="https://eurodetal.pro/upload/resize_cache/iblock/c18/500_500_140cd750bba9870f18aada2478b24840a/el6or4gatw0vp01avo9f9q7k82sf0c3y.JPEG"
                        alt="Запчасти"/>
                    <h4>Запчасти и аксессуары ЕКБДеталь</h4>
                    <p>49 товаров</p>
                    <p className="catalog-description">Запчасти и аксессуары от ЕКБДеталь</p>
                </div>
            </div>
        </div>

    );
};

export default TypeListBox;