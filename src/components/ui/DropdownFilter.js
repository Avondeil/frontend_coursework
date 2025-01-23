import React, { useState } from "react";

const DropdownFilter = ({ label, options, selected, onChange, getOptionLabel, enableRange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [range, setRange] = useState({ from: "", to: "" });

    // Убедимся, что getOptionLabel всегда функция
    const getLabel = (option) => {
        if (typeof getOptionLabel === "function") {
            return getOptionLabel(option);
        }
        return typeof option === "string" ? option : JSON.stringify(option); // Фоллбэк на строковое значение
    };

    // Фильтрация опций по поиску и диапазону
    const filteredOptions = options.filter((opt) => {
        const label = getLabel(opt);

        // Фильтрация по поиску
        const matchesSearch =
            typeof label === "string" && label.toLowerCase().includes(search.toLowerCase());

        // Фильтрация по диапазону (если диапазон включен)
        if (enableRange) {
            const numericValue = parseFloat(label);
            const fromValid = !range.from || numericValue >= parseFloat(range.from);
            const toValid = !range.to || numericValue <= parseFloat(range.to);

            return matchesSearch && fromValid && toValid;
        }

        return matchesSearch;
    });

    // Обработка изменения диапазона с проверкой на отрицательные значения
    const handleRangeChange = (key, value) => {
        const sanitizedValue = value === "" ? "" : Math.max(0, Number(value)); // Замена отрицательных значений на 0
        setRange((prev) => ({ ...prev, [key]: sanitizedValue }));
    };

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
                    {/* Поле для поиска */}
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="dropdown-search"
                    />
                    {/* Поля для диапазона (только если enableRange=true) */}
                    {enableRange && (
                        <div className="dropdown-range">
                            <input
                                type="number"
                                placeholder="От"
                                value={range.from}
                                onChange={(e) => handleRangeChange("from", e.target.value)}
                                className="dropdown-search"
                                min="0"
                            />
                            <input
                                type="number"
                                placeholder="До"
                                value={range.to}
                                onChange={(e) => handleRangeChange("to", e.target.value)}
                                className="dropdown-search"
                                min="0"
                            />
                        </div>
                    )}
                    {/* Список опций */}
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
