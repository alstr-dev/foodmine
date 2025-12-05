import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "./AdminContext";

function AdminProtectedRoute({ children }) {
    const { isLoggedIn } = useAdmin();

    if (isLoggedIn) {
        return children;
    } else {
        return <Navigate to="/admin-login" />;
    }
}

export default AdminProtectedRoute;
