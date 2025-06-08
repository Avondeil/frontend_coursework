import React from "react";
import "../styles/TypeListBox.css"
import {useNavigate} from "react-router-dom";

const TypeListBox = () => {

    const navigate = useNavigate();

    const handleCategoryClick = (category) => {
        navigate('/autoparts', { state: { category } });
    };

    return (
        <div className="typeList-container">
            <h3 className="catalog-heading">Каталог товаров</h3>
            <p>Компания ЕКБДеталь производит БАГАЖНИКИ, АВТОБОКСЫ, ЗАПЧАСТИ и
                АКСЕССУАРЫ.</p>
            <p>Ниже предлагаем Вам ознакомиться с ассортиментом.</p>

            <div className="catalog-types">
                <div className="catalog-item" onClick={() => handleCategoryClick("autoboxes")}>
                    <img src="https://www.rackworld.ru/upload/iblock/fd4/i2ima2ntz1xcttg20sz5wpnbnxz7vq04/avtomobilnyy-boks-taurus-altro-460-cb-chernyy-karbon-.png" alt="Автобокс"/>
                    <h4>Автобоксы ЕКБДеталь</h4>
                    <p className="catalog-description">Автобоксы от ЕКБДеталь</p>
                </div>
                <div className="catalog-item" onClick={() => handleCategoryClick("roof_racks")}>
                    <img
                        src="https://le96.ru/upload/iblock/4f8/2flyib0ot809qf12zx44nlywcxaboamz.png"
                        alt="Багажники"/>
                    <h4>Багажники ЕКБДеталь</h4>
                    <p className="catalog-description">Багажники от ЕКБДеталь</p>
                </div>
                <div className="catalog-item" onClick={() => handleCategoryClick("parts_accessories")}>
                    <img
                        src="https://app.miles-auto.com/uploads/categories/9_67dd6e08c1879.png"
                        alt="Запчасти"/>
                    <h4>Запчасти и аксессуары ЕКБДеталь</h4>
                    <p className="catalog-description">Запчасти и аксессуары от ЕКБДеталь</p>
                </div>
            </div>
        </div>

    );
};

export default TypeListBox;