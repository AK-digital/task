// src/services/firebase/auth.js
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    GoogleAuthProvider,
    GithubAuthProvider
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export const authService = {
    async signInWithEmail(email, password) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    },

    async signInWithProvider(provider) {
        const providerInstance = provider === 'google' ? googleProvider : githubProvider;
        const result = await signInWithPopup(auth, providerInstance);
        return result.user;
    },

    async createUserDocument(user, additionalData = {}) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            id: user.uid,
            email: user.email,
            name: user.displayName || additionalData.name,
            profilePicture: user.photoURL || 'default-profile-pic.svg',
            ...additionalData
        }, { merge: true });
    },

    async signOut() {
        await signOut(auth);
    }
};

