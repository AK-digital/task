import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearError, addToast } from '../../store/slices/uiSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRedo } from '@fortawesome/free-solid-svg-icons';

class ErrorBoundaryFallback extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });

        // Log l'erreur vers un service externe
        console.error('Error caught by boundary:', error, errorInfo);

        // Notifier l'utilisateur
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorDisplay
                    error={this.state.error}
                    errorInfo={this.state.errorInfo}
                    onReset={() => {
                        this.setState({ hasError: false, error: null, errorInfo: null });
                        this.props.onReset?.();
                    }}
                />
            );
        }

        return this.props.children;
    }
}

const ErrorDisplay = ({ error, errorInfo, onReset }) => (
    <div className="error-boundary" role="alert">
        <div className="error-content">
            <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="error-icon"
            />
            <h2>Une erreur est survenue</h2>

            {process.env.NODE_ENV === 'development' && (
                <div className="error-details">
                    <p>{error?.message}</p>
                    <pre>{errorInfo?.componentStack}</pre>
                </div>
            )}

            <div className="error-actions">
                <button onClick={onReset} className="retry-btn">
                    <FontAwesomeIcon icon={faRedo} />
                    Réessayer
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="reload-btn"
                >
                    Recharger la page
                </button>
            </div>
        </div>
    </div>
);

// HOC pour wrapper les composants avec ErrorBoundary
export const withErrorBoundary = (WrappedComponent, options = {}) => {
    return function WithErrorBoundary(props) {
        const dispatch = useDispatch();

        const handleError = (error) => {
            dispatch(addToast({
                type: 'error',
                message: options.fallbackMessage || 'Une erreur est survenue',
                duration: 5000
            }));
            options.onError?.(error);
        };

        return (
            <ErrorBoundaryFallback onError={handleError} onReset={() => dispatch(clearError())}>
                <WrappedComponent {...props} />
            </ErrorBoundaryFallback>
        );
    };
};

const ErrorBoundary = ({ children }) => {
    const dispatch = useDispatch();
    const error = useSelector(state => state.ui.error);

    return (
        <ErrorBoundaryFallback
            onError={(error) => {
                dispatch(addToast({
                    type: 'error',
                    message: 'Une erreur est survenue',
                    duration: 5000
                }));
            }}
            onReset={() => dispatch(clearError())}
        >
            {children}
        </ErrorBoundaryFallback>
    );
};

export default ErrorBoundary;