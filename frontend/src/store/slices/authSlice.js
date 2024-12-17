import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from '../../config/firebase';
import Cookies from 'js-cookie';

const initialState = {
    currentUser: null,
    loading: false,
    error: null
};

// Ajout de l'export manquant pour signUp
export const signUp = createAsyncThunk(
    'auth/signUp',
    async ({ email, password, name }, { rejectWithValue }) => {
        try {
            // Création du compte Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Compte Firebase créé');

            // Génération du token
            const token = await user.getIdToken();
            console.log('Token généré');

            // Création du profil utilisateur
            const userToSave = {
                id: user.uid,
                name: name || email.split('@')[0],
                email: user.email,
                authToken: token,
                profilePicture: 'default-profile-pic.svg',
                createdAt: new Date().toISOString()
            };

            // Sauvegarde dans Firestore
            await setDoc(doc(db, 'users', user.uid), userToSave);
            console.log('Profil utilisateur créé dans Firestore');

            // Sauvegarde du token
            Cookies.set("authToken", token, { expires: 7 });

            return userToSave;
        } catch (error) {
            console.error('Erreur inscription:', error);
            let errorMessage = 'Une erreur est survenue lors de l\'inscription';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Cette adresse email est déjà utilisée';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Adresse email invalide';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'L\'inscription par email/mot de passe n\'est pas activée';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Le mot de passe doit faire au moins 6 caractères';
                    break;
                default:
                    errorMessage = error.message;
            }
            return rejectWithValue(errorMessage);
        }
    }
);

export const signIn = createAsyncThunk(
    'auth/signIn',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Connexion Firebase réussie');

            const user = userCredential.user;
            const token = await user.getIdToken();

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            const userToSave = {
                id: user.uid,
                name: userData.name || email.split('@')[0],
                email: user.email,
                authToken: token,
                ...userData,
                lastLoginAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), userToSave, { merge: true });
            Cookies.set("authToken", token, { expires: 7 });

            return userToSave;
        } catch (error) {
            console.error('Erreur connexion:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const signInWithSSO = createAsyncThunk(
    'auth/signInWithSSO',
    async (providerName, { rejectWithValue }) => {
        try {
            const provider = providerName === 'google' ? googleProvider : githubProvider;
            const result = await signInWithPopup(auth, provider);
            console.log('Connexion SSO réussie');

            const user = result.user;
            const token = await user.getIdToken();

            const userToSave = {
                id: user.uid,
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                authToken: token,
                profilePicture: user.photoURL || 'default-profile-pic.svg',
                lastLoginAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), userToSave, { merge: true });
            Cookies.set("authToken", token, { expires: 7 });

            return userToSave;
        } catch (error) {
            console.error('Erreur SSO:', error);
            return rejectWithValue(error.message);
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await signOut(auth);
            Cookies.remove("authToken");
            return null;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearUser: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // SignUp
            .addCase(signUp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signUp.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(signUp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // SignIn
            .addCase(signIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signIn.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(signIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // SSO
            .addCase(signInWithSSO.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signInWithSSO.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(signInWithSSO.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.currentUser = null;
                state.loading = false;
                state.error = null;
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setUser, clearError, clearUser } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;