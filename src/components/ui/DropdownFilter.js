import React, { useState } from "react";

const DropdownFilter = ({ label, options, selected, onChange, getOptionLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Убедимся, что getOptionLabel всегда функция
    const getLabel = (option) => {
        if (typeof getOptionLabel === "function") {
            return getOptionLabel(option);
        }
        return typeof option === "string" ? option : JSON.stringify(option); // Фоллбэк на строковое значение
    };

    // Фильтрация опций
    const filteredOptions = options.filter((opt) => {
        const label = getLabel(opt);
        return typeof label === "string" && label.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="dropdown">
            <div className="dropdown-label" onClick={() => setIsOpen(!isOpen)}>
                <span>
                    {label}: {selected ? getLabel(selected) : "Не выбрано"}
                </span>
                <span className={`arrow ${isOpen ? "open" : ""}`}></span>
            </div>
            {isOpen && (
                <div className="dropdown-menu">
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="dropdown-search"
                    />
                    <ul className="dropdown-options">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <li
                                    key={index}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                >
                                    {getLabel(option)}
                                </li>
                            ))
                        ) : (
                            <li className="dropdown-no-results">Нет результатов</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DropdownFilter;
