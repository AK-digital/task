const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const cors = require("cors");
const admin = require('firebase-admin');

const mailRouter = require("./routes/mail.routes");
const { verifyToken } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

// Initialiser Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require('./serviceAccountKey.json')),
        databaseURL: "https://task-2a7d9.firebaseio.com" // Ajoutez votre URL de base de données
    });
}

// Configuration CORS plus permissive pour le développement
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',  // Vite dev server
            'http://localhost:3000',  // Express backend
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'https://task.akdigital.fr'
        ];

        // Permettre les requêtes sans origin (comme Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
    console.log(`\n${new Date().toISOString()}`);
    console.log(`📝 Request: ${req.method} ${req.url}`);
    console.log('�headers:', req.headers);

    // Logger le corps de la requête sauf pour les uploads de fichiers
    if (!req.url.includes('/upload')) {
        console.log('📦 Body:', req.body);
    }

    // Intercepter la réponse
    const oldSend = res.send;
    res.send = function (data) {
        console.log('📤 Response:', data);
        return oldSend.apply(res, arguments);
    };

    next();
});

// Routes pour l'authentification
app.post('/api/auth/verify-token', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({ error: 'Token manquant' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await admin.auth().getUser(decodedToken.uid);

        res.json({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        });
    } catch (error) {
        console.error('Erreur de vérification du token:', error);
        res.status(401).json({ error: 'Token invalide' });
    }
});

// Route pour récupérer les données utilisateur
app.get('/api/users/me', verifyToken, async (req, res) => {
    try {
        const userDoc = await admin.firestore()
            .collection('users')
            .doc(req.user.uid)
            .get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        res.json(userDoc.data());
    } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour la recherche d'utilisateur par email
app.get('/api/users/by-email', async (req, res) => {
    try {
        const { email } = req.query;
        console.log('Recherche utilisateur par email:', email);

        const userRecord = await admin.auth().getUserByEmail(email);
        console.log('Utilisateur trouvé:', userRecord);

        const userDoc = await admin.firestore()
            .collection('users')
            .doc(userRecord.uid)
            .get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Données utilisateur non trouvées' });
        }

        res.json(userDoc.data());
    } catch (error) {
        console.error('Erreur lors de la recherche utilisateur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Configuration Upload
const uploadsDir = path.join(__dirname, "uploads");
fs.ensureDirSync(uploadsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { userId, projectId } = req.body;
        const dir = path.join(uploadsDir, userId, projectId);
        fs.ensureDirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Route Upload
app.post('/upload', verifyToken, upload.array('files'), async (req, res) => {
    try {
        console.log('Upload files request:', req.files);
        if (!req.files?.length) {
            return res.status(400).json({ error: 'Aucun fichier uploadé' });
        }

        const files = req.files.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            url: `/uploads/${req.body.userId}/${req.body.projectId}/${file.filename}`
        }));

        // Sauvegarder les références dans Firestore
        const batch = admin.firestore().batch();
        files.forEach(file => {
            const fileRef = admin.firestore().collection('files').doc();
            batch.set(fileRef, {
                ...file,
                userId: req.body.userId,
                projectId: req.body.projectId,
                uploadedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        await batch.commit();

        res.status(201).json(files);
    } catch (error) {
        console.error('Erreur upload:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes email
app.use('/api', mailRouter);

// Servir les fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
}

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error('Erreur globale:', err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur'
    });
});

// Route catch-all pour le frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port} en mode ${process.env.NODE_ENV || 'development'}`);
});