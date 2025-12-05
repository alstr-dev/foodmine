import React from "react";
import { Navigate } from "react-router-dom";

function DpProtectedRoute({ children }) {
    const isDpLoggedIn = JSON.parse(localStorage.getItem("isDpLoggedIn")) || false;

    if (isDpLoggedIn) {
        return children;
    } else {
        return <Navigate to="/login" />;
    }
}

export default DpProtectedRoute;
