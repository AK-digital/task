import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../config/firebase';
import { setUser, clearUser } from '../store/slices/authSlice';

export const useAuth = () => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // L'utilisateur est connecté
                console.log('Utilisateur connecté:', user.email);
                dispatch(setUser({
                    id: user.uid,
                    email: user.email,
                    name: user.displayName || user.email.split('@')[0],
                    profilePicture: user.photoURL || 'default-profile-pic.svg'
                }));
            } else {
                // L'utilisateur n'est pas connecté
                console.log('Aucun utilisateur connecté');
                dispatch(clearUser());
            }
            setIsLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, [dispatch]);

    return { isLoading };
};

export default useAuth;