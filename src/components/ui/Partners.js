import React from "react";
import "../styles/Partners.css"

const Partners = () =>
{
    return (
        <div className="partners-container">
            <h1 className="partners-heading">Почему сотрудничать с ЕКБДеталь — это правильный выбор?</h1>
            <p>Мы предлагаем широкий ассортимент качественных автомобильных деталей по конкурентным ценам.
               Наша команда обеспечивает надежную поддержку на всех этапах: от выбора товара до доставки.
                Работаем напрямую с проверенными поставщиками, что гарантирует оригинальность и долговечность продукции.
                Быстрое обслуживание, индивидуальный подход и прозрачные условия делают нас вашим надежным партнером в мире автозапчастей.
                С ЕКБДеталь вы экономите время и деньги, получая только лучшее для вашего автомобиля!</p>
            <p id="company_text">Компании, которые уже сотрудничают с нами</p>
            <div className="partners-list">
                <div className="partners-item">
                    <img
                        src="https://avatars.dzeninfra.ru/get-zen_doc/99101/pub_5ab0e4061aa80c5e9021f89a_5ab0fd3ed7bf218d55a4a8ac/scale_1200"
                        alt={"logo-partner"}/>
                </div>
                <div className="partners-item">
                    <img
                        src="https://metaprom.ru/cf_images/logo47925.gif"
                        alt={"logo-partner"}/>
                </div>
                <div className="partners-item">
                    <img
                        src="https://yurbel.ru/system/global_price_replacements_logo/249/nipparts_original.jpg?1607716181"
                        alt={"logo-partner"}/>
                </div>
                <div className="partners-item">
                    <img
                        src="https://www.e-tape.ru/_upload/GParts.jpg"
                        alt={"logo-partner"}/>
                </div>
            </div>
        </div>
    );
};

export default Partners;