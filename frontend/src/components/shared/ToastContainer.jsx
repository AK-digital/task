// src/components/shared/ToastContainer.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectToasts } from '../../store/slices/uiSlice';
import Toast from './ToastContainer';
import '../../assets/css/toast.css';

const ToastContainer = () => {
    const toasts = useSelector(selectToasts);

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    );
};

export default ToastContainer;