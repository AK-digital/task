import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { closeModal, closeAllModals } from '../../store/slices/uiSlice';

const Modal = ({ children, onClose, className = '', showCloseButton = true }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose?.() || dispatch(closeModal());
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose, dispatch]);

    return ReactDOM.createPortal(
        <div
            className="modal-overlay"
            onClick={() => onClose?.() || dispatch(closeModal())}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`modal-content ${className}`}
                onClick={e => e.stopPropagation()}
            >
                {showCloseButton && (
                    <button
                        className="modal-close-btn"
                        onClick={() => onClose?.() || dispatch(closeModal())}
                        aria-label="Fermer"
                    >
                        ×
                    </button>
                )}
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;