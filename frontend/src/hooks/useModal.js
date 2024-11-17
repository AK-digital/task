import { useDispatch } from 'react-redux';
import { openModal, closeModal } from '../store/slices/uiSlice';

export const useModal = () => {
    const dispatch = useDispatch();

    const showModal = (type, props = {}) => {
        dispatch(openModal({ type, props }));
    };

    const hideModal = () => {
        dispatch(closeModal());
    };

    const showConfirmation = (message, onConfirm, onCancel) => {
        showModal('confirmation', {
            message,
            onConfirm: () => {
                onConfirm?.();
                hideModal();
            },
            onCancel: () => {
                onCancel?.();
                hideModal();
            }
        });
    };

    return {
        showModal,
        hideModal,
        showConfirmation
    };
};