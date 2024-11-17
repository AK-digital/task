// src/components/shared/Toast.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';
import '../../assets/css/toast.css';

const Toast = ({ id, message, type = 'info', duration = 3000 }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeToast(id));
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, dispatch]);

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-message">{message}</span>
            <button
                className="toast-close"
                onClick={() => dispatch(removeToast(id))}
            >
                ×
            </button>
        </div>
    );
};

export default Toast;