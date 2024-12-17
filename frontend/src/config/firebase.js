import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDk5MgY2tcQnVKpahtLYeDtTCU9sdkRqKo",
    authDomain: "task-2a7d9.firebaseapp.com",
    projectId: "task-2a7d9",
    storageBucket: "task-2a7d9.appspot.com",
    messagingSenderId: "187122931513",
    appId: "1:187122931513:web:d1311a40bb4d41e8b5bae8",
    measurementId: "G-V7E2GM6QB9"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configuration des providers d'authentification
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Configuration additionnelle des providers
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

githubProvider.setCustomParameters({
    prompt: 'consent'
});

// Fonction utilitaire pour tester la connexion
const testConnection = async () => {
    try {
        const currentUser = auth.currentUser;
        console.log('État de la connexion Firebase :', {
            isInitialized: !!app,
            currentUser: currentUser ? {
                uid: currentUser.uid,
                email: currentUser.email
            } : null
        });
        return true;
    } catch (error) {
        console.error('Erreur de connexion Firebase:', error);
        return false;
    }
};

export {
    auth,
    db,
    storage,
    googleProvider,
    githubProvider,
    testConnection
};