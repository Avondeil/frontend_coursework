import React, { useState, useEffect } from "react";

const DropdownFilter = ({ label, options, selected, onChange, getOptionLabel, enableRange, reset }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [range, setRange] = useState({ from: "", to: "" });

    const getLabel = (option) => {
        if (typeof getOptionLabel === "function") {
            return getOptionLabel(option);
        }
        return typeof option === "string" ? option : JSON.stringify(option);
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

        if (enableRange) {
            const numericValue = parseFloat(label);
            const fromValid = !range.from || numericValue >= parseFloat(range.from);
            const toValid = !range.to || numericValue <= parseFloat(range.to);
            return matchesSearch && fromValid && toValid;
        }

        return matchesSearch;
    });

    const validOptions = filteredOptions.filter((opt) => opt.isValid);
    const invalidOptions = filteredOptions.filter((opt) => !opt.isValid);

    const sortedOptions = [...validOptions, ...invalidOptions];

    const handleRangeChange = (key, value) => {
        const sanitizedValue = value === "" ? "" : Math.max(0, Number(value));
        setRange((prev) => ({ ...prev, [key]: sanitizedValue }));
    };

    return (
        <div className="dropdown">
            <div className="dropdown-label" onClick={() => setIsOpen(!isOpen)}>
                <span>{label}: {selected ? getLabel({ value: selected }) : "Не выбрано"}</span>
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
                                    className={option.isValid ? (selected === option.value ? "selected" : "") : "inactive"}
                                    onClick={() => {
                                        if (option.isValid) {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }
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