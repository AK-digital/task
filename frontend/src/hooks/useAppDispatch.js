import { useDispatch } from 'react-redux';
import { setLoading, addToast } from '../store/slices/uiSlice';

export const useAppDispatch = () => {
    const dispatch = useDispatch();

    const dispatchWithLoading = async (action, options = {}) => {
        const {
            showLoading = true,
            successMessage,
            errorMessage
        } = options;

        try {
            if (showLoading) {
                dispatch(setLoading(true));
            }

            const result = await dispatch(action).unwrap();

            if (successMessage) {
                dispatch(addToast({
                    message: successMessage,
                    type: 'success'
                }));
            }

            return result;
        } catch (error) {
            const message = errorMessage || error.message || 'Une erreur est survenue';
            dispatch(addToast({
                message,
                type: 'error'
            }));
            throw error;
        } finally {
            if (showLoading) {
                dispatch(setLoading(false));
            }
        }
    };

    return dispatchWithLoading;
};
