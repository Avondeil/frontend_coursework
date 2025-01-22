import React, { useEffect } from 'react';
import '../styles/PhoneListModal.css'; // Подключаем стили для модального окна
import { MdOutlineSupportAgent } from "react-icons/md";
import { FaHouseCircleCheck } from "react-icons/fa6";
import { TbFreeRights } from "react-icons/tb";
const PhoneListModal = ({ isOpen, toggleModal }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => document.body.classList.remove('no-scroll');
    }, [isOpen]);

    return (
        <>
            <div className={`phone-list-modal ${isOpen ? 'visible' : 'hidden'}`}>
                <div className="modalPhone-header">
                    <h2>Контактные номера</h2>
                    <button onClick={toggleModal} className="close-modal-btn">×</button>
                </div>
                <div className="modalPhone-content">
                    <ul className="phone-list">
                        <li>
                            <a href="tel:+70003334455">
                                <FaHouseCircleCheck fontSize="30px"/>
                                <p>
                                    +7 (000) 333-44-55<br/>
                                    <span className="phone-description">Главный офис ЕКБДеталь</span>
                                </p>
                            </a>
                        </li>
                        <li>
                            <a href="tel:+70002223344">
                                <MdOutlineSupportAgent fontSize="30px"/>
                                <p>
                                    +7 (000) 222-33-44<br/>
                                    <span className="phone-description">Служба поддержки</span>
                                </p>
                            </a>
                        </li>
                        <li><a href="tel:+79999999999">
                            <TbFreeRights  fontSize="30px"/>
                            <p>
                                +7 (999) 999-99-99<br/>
                                <span className="phone-description">Звонок бесплатный</span>
                            </p>
                        </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={`backdrop ${isOpen ? 'show' : ''}`} onClick={toggleModal}></div>
        </>
    );
};

export default PhoneListModal;
