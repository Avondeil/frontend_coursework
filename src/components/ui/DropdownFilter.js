import React, { useState, useEffect } from "react";

const DropdownFilter = ({ label, options, selected, onChange, getOptionLabel, enableRange, reset }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [range, setRange] = useState({ from: "", to: "" });

    const getLabel = (option) => {
        if (!option) return "";
        if (typeof option === "string") return option;
        if (typeof getOptionLabel === "function") {
            return getOptionLabel(option);
        }
        return option.label || option.name || option.value || JSON.stringify(option);
    };

    useEffect(() => {
        if (reset) {
            setSearch("");
            setRange({ from: "", to: "" });
            onChange(null);
        }
    }, [reset, onChange]);

    const filteredOptions = options.filter((opt) => {
        const label = getLabel(opt);
        const matchesSearch = typeof label === "string" && label.toLowerCase().includes(search.toLowerCase());

        if (enableRange && !isNaN(parseFloat(label))) {
            const numericValue = parseFloat(label);
            const fromValid = !range.from || numericValue >= parseFloat(range.from);
            const toValid = !range.to || numericValue <= parseFloat(range.to);
            return matchesSearch && fromValid && toValid;
        }

        return matchesSearch;
    });

    // Опции без isValid считаются валидными для AutoParts (марки, модели, категории)
    const validOptions = filteredOptions.filter((opt) => opt.isValid !== false);
    const invalidOptions = filteredOptions.filter((opt) => opt.isValid === false);

    const sortedOptions = [...validOptions, ...invalidOptions];

    const handleRangeChange = (key, value) => {
        const sanitizedValue = value === "" ? "" : Math.max(0, Number(value));
        setRange((prev) => ({ ...prev, [key]: sanitizedValue }));
    };

    return (
        <div className="dropdown">
            <div className="dropdown-label" onClick={() => setIsOpen(!isOpen)}>
                <span>{label}: {selected ? getLabel(selected) : "Не выбрано"}</span>
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
                    <ul className="dropdown-options">
                        {sortedOptions.length > 0 ? (
                            sortedOptions.map((option, index) => (
                                <li
                                    key={index}
                                    className={
                                        option.isValid !== false
                                            ? getLabel(selected) === getLabel(option)
                                                ? "selected"
                                                : ""
                                            : "inactive"
                                    }
                                    onClick={() => {
                                        if (option.isValid !== false) {
                                            // Для Catalog: option.value, для AutoParts: option или option.value
                                            const value = option.value !== undefined ? option.value : option;
                                            onChange(value);
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    {getLabel(option)}
                                </li>
                            ))
                        ) : (
                            <li className="inactive">Нет выбора</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DropdownFilter;