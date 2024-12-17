import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export async function testFirebaseConnection() {
    console.log('Test de connexion Firebase...');

    try {
        // Test Auth
        console.log('État de auth:', auth);
        console.log('Auth currentUser:', auth.currentUser);

        // Test Firestore
        console.log('Test connexion Firestore...');
        const testDoc = doc(db, 'test', 'test');
        try {
            await getDoc(testDoc);
            console.log('Connexion Firestore OK');
        } catch (e) {
            console.error('Erreur Firestore:', e);
        }

        return 'Tests Firebase terminés';
    } catch (error) {
        console.error('Erreur test Firebase:', error);
        throw error;
    }
}