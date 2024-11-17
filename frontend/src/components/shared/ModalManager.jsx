import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentModal } from '../../store/slices/uiSlice';
import Modal from './Modal';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="confirmation-modal">
        <h3>Confirmation</h3>
        <p>{message}</p>
        <div className="confirmation-actions">
            <button onClick={onConfirm} className="confirm-btn">
                Confirmer
            </button>
            <button onClick={onCancel} className="cancel-btn">
                Annuler
            </button>
        </div>
    </div>
);

const modalComponents = {
    confirmation: ConfirmationModal,
    // Ajoutez d'autres types de modaux ici selon vos besoins
};

const ModalManager = () => {
    const currentModal = useSelector(selectCurrentModal);

    if (!currentModal) return null;

    const ModalComponent = modalComponents[currentModal.type];
    if (!ModalComponent) return null;

    return (
        <Modal>
            <ModalComponent {...currentModal.props} />
        </Modal>
    );
};

export default ModalManager;