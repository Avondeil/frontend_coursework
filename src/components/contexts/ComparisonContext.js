import React, { createContext, useState, useEffect } from "react";

export const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
    const [comparisonItems, setComparisonItems] = useState(() => {
        const storedItems = localStorage.getItem("comparisonItems");
        return storedItems ? JSON.parse(storedItems) : [];
    });

    useEffect(() => {
        localStorage.setItem("comparisonItems", JSON.stringify(comparisonItems));
    }, [comparisonItems]);

    return (
        <ComparisonContext.Provider value={{ comparisonItems, setComparisonItems }}>
            {children}
        </ComparisonContext.Provider>
    );
};