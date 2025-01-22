import React from 'react';
import "../styles/Box.css"
import {useNavigate} from "react-router-dom";


const Box = () =>
{
    const navigate = useNavigate();
    const handlePageClick = (page) => {
        if (page === "about")
        navigate(`/about`);
        else if (page === "catalog")
        navigate(`/catalog`);
    };
    return (
        <div className="box">
            <h1>
                Высококачественное<br/>
                производство<br/>
                деталей
            </h1>

            <div className="button-container">
                <button className="info" onClick={() => handlePageClick("about")}>О нас</button>
                <button className="button_message" onClick={() => handlePageClick("catalog")}>Перейти в каталог</button>
            </div>
        </div>
    );
};

export default Box;