import React, { createContext, useContext, useState } from 'react';

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [userName, setUserName] = useState(null);
    const [userId, setUserId] = useState(null);
    const [emailId, setEmailId] = useState(null);
    const [userPhone, setUserPhone] = useState(null);
    const [userType, setUserType] = useState(null);
    const [serverResponseForCustomer, setServerResponseForCustomer] = useState(null);
    const [itemCount, setItemCount] = useState(null);

    return (
        <UserContext.Provider value={{ userName, setUserName, userId, setUserId, userType, setUserType, serverResponseForCustomer, setServerResponseForCustomer, itemCount, setItemCount, emailId, setEmailId, userPhone, setUserPhone }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the UserContext
export const useUser = () => {
    return useContext(UserContext);
};
