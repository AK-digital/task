import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDk5MgY2tcQnVKpahtLYeDtTCU9sdkRqKo",
    authDomain: "task-2a7d9.firebaseapp.com",
    projectId: "task-2a7d9",
    storageBucket: "task-2a7d9.appspot.com",
    messagingSenderId: "187122931513",
    appId: "1:187122931513:web:d1311a40bb4d41e8b5bae8",
    measurementId: "G-V7E2GM6QB9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider };