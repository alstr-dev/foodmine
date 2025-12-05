import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../UserContext";

function CustomerProtectedRoute({ children }) {

    const { userId, userType, serverResponseForCustomer } = useUser();

    if (userId !== null && userType === 'customer') {

        return children;
    }

    if (serverResponseForCustomer === 401) {
        return <Navigate to="/customer/login" />;
    }
}

export default CustomerProtectedRoute;
