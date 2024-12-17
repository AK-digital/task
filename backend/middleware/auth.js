const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
    console.log('\n🔐 Authentication Middleware');
    console.log('Headers:', req.headers);

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            console.log('❌ No Bearer token found');
            return res.status(401).json({ error: 'Token d\'authentification manquant' });
        }

        const token = authHeader.split('Bearer ')[1];
        console.log('🎟️ Token found:', token.substring(0, 20) + '...');

        const decodedToken = await admin.auth().verifyIdToken(token);
        console.log('✅ Token verified:', decodedToken);

        const userRecord = await admin.auth().getUser(decodedToken.uid);
        console.log('👤 User record retrieved:', userRecord.uid);

        req.user = {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            ...decodedToken
        };

        console.log('✨ Authentication successful');
        next();
    } catch (error) {
        console.error('🚫 Authentication error:', error);
        res.status(401).json({
            error: 'Token invalide ou expiré',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { verifyToken };