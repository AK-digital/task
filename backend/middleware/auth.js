// Dans backend/middleware/auth.js
const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);

        // Vérifier l'utilisateur dans Firestore
        const userRef = admin.firestore().doc(`users/${decodedToken.uid}`);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        req.user = { ...decodedToken, ...userDoc.data() };
        next();
    } catch (error) {
        console.error('Erreur de vérification du token:', error);
        res.status(401).json({ message: 'Token invalide' });
    }
};

module.exports = { verifyToken };