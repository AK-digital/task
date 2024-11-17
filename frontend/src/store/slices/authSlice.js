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

// État initial
const initialState = {
    currentUser: null,
    loading: false,
    error: null
};

// Thunk pour l'inscription
export const signUp = createAsyncThunk(
    'auth/signUp',
    async ({ email, password, name }, { rejectWithValue }) => {
        try {
            // Création du compte avec Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();

            // Création du profil utilisateur dans Firestore
            const userToSave = {
                id: user.uid,
                name: name || email.split('@')[0],
                email: user.email,
                authToken: token,
                profilePicture: 'default-profile-pic.svg',
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), userToSave);

            // Sauvegarder le token dans les cookies
            Cookies.set("authToken", token, { expires: 7 });

            return userToSave;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk pour la connexion par email/password
export const signIn = createAsyncThunk(
    'auth/signIn',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();

            // Récupérer les données utilisateur de Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            const userToSave = {
                id: user.uid,
                name: userData.name || email.split('@')[0],
                email: user.email,
                authToken: token,
                ...userData
            };

            // Mise à jour des données dans Firestore
            await setDoc(doc(db, 'users', user.uid), userToSave, { merge: true });

            // Sauvegarder le token dans les cookies
            Cookies.set("authToken", token, { expires: 7 });

            return userToSave;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk pour la connexion SSO
export const signInWithSSO = createAsyncThunk(
    'auth/signInWithSSO',
    async (providerName, { rejectWithValue }) => {
        try {
            const provider = providerName === 'google' ? googleProvider : githubProvider;
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const token = await user.getIdToken();

            // Créer/mettre à jour l'utilisateur dans Firestore
            const userData = {
                id: user.uid,
                name: user.displayName || user.email.split('@')[0],
                email: user.email,
                authToken: token,
                profilePicture: user.photoURL || 'default-profile-pic.svg',
                currentProjectId: null,
                lastLoginAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
            Cookies.set("authToken", token, { expires: 7 });

            return userData;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Thunk pour la déconnexion
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

// Création du slice
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
            // Gestion de l'inscription
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

            // Gestion de la connexion email/password
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

            // Gestion de la connexion SSO
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

            // Gestion de la déconnexion
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

// Export des actions synchrones
export const { setUser, clearError, clearUser } = authSlice.actions;

// Export du reducer
export default authSlice.reducer;

// Sélecteurs
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;