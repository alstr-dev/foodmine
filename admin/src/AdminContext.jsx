import React, { createContext, useContext, useState } from 'react';

const AdminContext = createContext({
    isLoggedIn: false,
    setIsLoggedIn: () => { }
});

export const AdminProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    });

    const updateLoginStatus = (status) => {
        setIsLoggedIn(status);
        localStorage.setItem('isLoggedIn', JSON.stringify(status));
    };

    return (
        <AdminContext.Provider value={{ isLoggedIn, setIsLoggedIn: updateLoginStatus }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
