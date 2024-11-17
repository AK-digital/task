import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAuthLoading } from '../store/slices/authSlice';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const PrivateRoute = ({ children }) => {
    const currentUser = useSelector(selectCurrentUser);
    const isLoading = useSelector(selectAuthLoading);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return currentUser ? children : <Navigate to="/signin" />;
};

export default PrivateRoute;