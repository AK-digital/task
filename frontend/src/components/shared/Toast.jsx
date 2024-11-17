import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { removeToast, selectToasts } from '../../store/slices/uiSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheck,
    faInfo,
    faExclamationTriangle,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

const ICONS = {
    success: faCheck,
    error: faTimes,
    warning: faExclamationTriangle,
    info: faInfo
};

const ANIMATION_DURATION = 300; // ms

const Toast = React.memo(({
    id,
    message,
    type = 'info',
    duration = 3000,
    onDismiss
}) => {
    const dispatch = useDispatch();

    const handleDismiss = useCallback(() => {
        const element = document.getElementById(`toast-${id}`);
        if (element) {
            element.style.animation = `slideOut ${ANIMATION_DURATION}ms forwards`;
            setTimeout(() => {
                onDismiss?.(id);
                dispatch(removeToast(id));
            }, ANIMATION_DURATION);
        }
    }, [id, dispatch, onDismiss]);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(handleDismiss, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, handleDismiss]);

    return (
        <div
            id={`toast-${id}`}
            className={`toast toast-${type}`}
            role="alert"
        >
            <div className="toast-icon">
                <FontAwesomeIcon icon={ICONS[type]} />
            </div>
            <span className="toast-message">{message}</span>
            <button
                className="toast-close"
                onClick={handleDismiss}
                aria-label="Fermer"
            >
                ×
            </button>
        </div>
    );
});

export const ToastContainer = () => {
    const toasts = useSelector(selectToasts);

    return createPortal(
        <div className="toast-container">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>,
        document.body
    );
};

Toast.displayName = 'Toast';
export default Toast;