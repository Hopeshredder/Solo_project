import React from 'react';
import { Navigate, useRouteError, useLocation } from 'react-router-dom';

// Checks to see if user has a valid token in localstorage
function useIsAuthenticated() {
    const token = localStorage.getItem('token');
    return Boolean(token);
}

// If user is not authenticated, redirect  to login screen
export default function ProtectedRoute({ children }) {
    const isAuthed = useIsAuthenticated();
    const location = useLocation();

    if (!isAuthed) {
        return <Navigate to="/login/" replace state={{ from: location }} />;
    }

    return children;
}