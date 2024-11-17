import { useDispatch } from 'react-redux';
import { setCurrentModal } from '../store/slices/uiSlice';

export const useConfirmation = () => {
    const dispatch = useDispatch();

    const confirm = (message, onConfirm, onCancel) => {
        dispatch(setCurrentModal({
            type: 'confirmation',
            props: {
                message,
                onConfirm: () => {
                    onConfirm?.();
                    dispatch(setCurrentModal(null));
                },
                onCancel: () => {
                    onCancel?.();
                    dispatch(setCurrentModal(null));
                }
            }
        }));
    };

    return confirm;
};