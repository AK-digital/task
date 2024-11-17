import React from 'react';
import { useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import { selectIsLoading } from '../../store/slices/uiSlice';

const LoadingSpinner = () => {
    const isLoading = useSelector(selectIsLoading);
    const loadingText = useSelector(state => state.ui.loadingText) || 'Chargement...';

    if (!isLoading) return null;

    return createPortal(
        <div
            className="loading-overlay"
            role="progressbar"
            aria-valuetext={loadingText}
        >
            <div className="loading-spinner">
                <div className="spinner" />
                <p>{loadingText}</p>
            </div>
        </div>,
        document.body
    );
};

export const LoadingButton = ({
    children,
    isLoading,
    disabled,
    className = '',
    spinnerSize = 'small',
    ...props
}) => (
    <button
        className={`loading-button ${className} ${isLoading ? 'is-loading' : ''}`}
        disabled={isLoading || disabled}
        {...props}
    >
        {isLoading ? (
            <>
                <div className={`button-spinner ${spinnerSize}`} />
                {children}
            </>
        ) : children}
    </button>
);

export const LoadingOverlay = ({ isLoading, children }) => (
    <div className="loading-container">
        {children}
        {isLoading && (
            <div className="loading-overlay local">
                <div className="spinner" />
            </div>
        )}
    </div>
);

export default LoadingSpinner;