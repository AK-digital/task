const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const { sendTaskAssignmentEmail } = require('./emailService');

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS
const corsOptions = {
    origin: ['https://task.akdigital.fr', 'http://localhost:5173', 'http://localhost:3000'],
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir les fichiers statiques
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
}

// Configuration de la base de données
const dbPath = process.env.DB_PATH || path.join(__dirname, 'db.json');

function readDb() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { userId, projectId, boardId, taskId } = req.body;
        const dir = path.join(__dirname, 'uploads', userId, projectId, boardId, taskId);
        fs.ensureDirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API génériques
app.get('/api/:resource', (req, res) => {
    const db = readDb();
    const resource = req.params.resource;
    if (db[resource]) {
        res.json(db[resource]);
    } else {
        res.status(404).json({ error: 'Resource not found' });
    }
});

app.post('/api/:resource', (req, res) => {
    const db = readDb();
    const resource = req.params.resource;
    if (!db[resource]) {
        db[resource] = [];
    }
    const newItem = { ...req.body };
    db[resource].push(newItem);
    writeDb(db);
    res.status(201).json(newItem);
});

// Routes spécifiques pour les utilisateurs
app.get('/api/users', (req, res) => {
    const { authToken } = req.query;
    if (!authToken) {
        return res.status(400).json({ error: 'Token d\'authentification manquant' });
    }
    const db = readDb();
    const users = db.users.filter(user => user.authToken === authToken);
    res.json(users);
});

app.get('/api/users/by-email', async (req, res) => {
    try {
        const email = req.query.email;
        const db = await readDb();
        const user = db.users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (error) {
        console.error('Erreur lors de la recherche de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.put('/api/users/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        db.users[userIndex] = { ...db.users[userIndex], ...req.body };
        writeDb(db);
        res.json(db.users[userIndex]);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.patch('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const db = readDb();
    const userIndex = db.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    writeDb(db);
    res.json(db.users[userIndex]);
});

// Routes pour les projets
app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const updatedProject = req.body;
    const db = readDb();
    const projectIndex = db.projects.findIndex(project => project.id === id);
    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }
    db.projects[projectIndex] = { ...db.projects[projectIndex], ...updatedProject };
    writeDb(db);
    res.json(db.projects[projectIndex]);
});

app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const db = readDb();
    const projectIndex = db.projects.findIndex(project => project.id === id);
    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }
    db.projects.splice(projectIndex, 1);
    writeDb(db);
    res.json({ message: 'Project deleted' });
});

// Route pour l'upload de fichiers
app.post('/upload', upload.array('files'), (req, res) => {
    try {
        console.log('Requête d\'upload reçue');
        console.log('Corps de la requête:', req.body);
        console.log('Fichiers reçus:', req.files);

        if (!req.files || req.files.length === 0) {
            console.log('Aucun fichier reçu');
            return res.status(400).json({ error: 'Aucun fichier n\'a été uploadé.' });
        }

        const files = req.files.map(file => {
            return {
                id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                name: file.originalname,
                size: file.size,
                type: file.mimetype,
                url: `/uploads/${req.body.userId}/${req.body.projectId}/${req.body.boardId}/${req.body.taskId}/${file.filename}`
            };
        });

        console.log('Fichiers traités:', files);

        // Ajout des informations des fichiers à db.json
        const db = readDb();
        if (!db.upload) {
            db.upload = [];
        }
        db.upload.push(...files);
        writeDb(db);

        console.log('Réponse envoyée:', files);
        return res.status(201).json(files);
    } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        return res.status(500).json({ error: 'Une erreur est survenue lors de l\'upload' });
    }
});

app.post('/api/notify-task-assignment', async (req, res) => {
    const { recipientEmail, taskDetails } = req.body;
    try {
        await sendTaskAssignmentEmail(recipientEmail, taskDetails);
        res.status(200).json({ message: 'Email de notification envoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de notification:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email de notification' });
    }
});

app.post('/api/test-email', async (req, res) => {
    console.log('Requête de test d\'email reçue');
    try {
        const testTaskDetails = {
            text: "Ceci est un email de test",
            priority: "Haute",
            deadline: new Date().toISOString().split('T')[0]
        };
        console.log('Envoi de l\'email de test...');
        await sendTaskAssignmentEmail("test@example.com", testTaskDetails);
        console.log('Email de test envoyé avec succès');
        res.status(200).json({ message: 'Email de test envoyé avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de test:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email de test' });
    }
});

// Ajouter ces routes dans server.js
app.get('/users', async (req, res) => {
    try {
        const db = await readDb();
        const { email } = req.query;

        if (email) {
            const user = db.users.find(u => u.email === email);
            res.json(user ? [user] : []);
        } else {
            res.json(db.users);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/users', async (req, res) => {
    try {
        const db = await readDb();
        const newUser = req.body;
        db.users.push(newUser);
        await writeDb(db);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/users/:id', async (req, res) => {
    try {
        const db = await readDb();
        const { id } = req.params;
        const updates = req.body;

        const userIndex = db.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        db.users[userIndex] = { ...db.users[userIndex], ...updates };
        await writeDb(db);
        res.json(db.users[userIndex]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur globale :', err);
    res.status(500).json({ error: 'Une erreur est survenue', details: err.message });
});

// Route catch-all pour le frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});
