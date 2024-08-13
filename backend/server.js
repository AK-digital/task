const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Utilise le port fourni par l'environnement ou 3000 par défaut

// Middleware CORS
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = ['https://task.akdigital.fr', 'http://localhost:5173'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir les fichiers statiques du frontend
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
}

// Chemin vers le fichier db.json
const dbPath = process.env.DB_PATH || path.join(__dirname, 'db.json');

// Fonction pour lire db.json
function readDb() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Fonction pour écrire dans db.json
function writeDb(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { userId, projectId, boardId, taskId } = req.body;
        const dir = path.join(__dirname, 'uploads', userId, projectId, boardId, taskId);
        fs.ensureDirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Exemple de route GET pour récupérer toutes les données d'une ressource
app.get('/api/:resource', (req, res) => {
    const db = readDb();
    const resource = req.params.resource;
    if (db[resource]) {
        res.json(db[resource]);
    } else {
        res.status(404).json({ error: 'Resource not found' });
    }
});

// Exemple de route POST pour ajouter une nouvelle entrée à une ressource
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


// Route GET pour obtenir un utilisateur par son token
app.get('/api/users', (req, res) => {
    const { authToken } = req.query;

    if (!authToken) {
        return res.status(400).json({ error: 'Token d\'authentification manquant' });
    }

    const db = readDb();
    const users = db.users.filter(user => user.authToken === authToken);

    res.json(users);
});

// Route GET pour récupérer un utilisateur par email
app.get('/api/users/by-email', (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email manquant.' });
    }

    const db = readDb();
    const user = db.users.find(u => u.email === email);

    if (user) {
        res.json([user]);
    } else {
        res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
});

// Route PUT pour mettre à jour un utilisateur
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

// Route PATCH pour mettre à jour un utilisateur
app.patch('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const db = readDb();
    const userIndex = db.users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Mise à jour des champs spécifiés
    db.users[userIndex] = { ...db.users[userIndex], ...updates };

    writeDb(db);

    res.json(db.users[userIndex]);
});

// Route POST pour créer un nouvel utilisateur
app.post('/api/users', (req, res) => {
    const db = readDb();
    if (!db.users) {
        db.users = [];
    }
    const newUser = req.body;
    db.users.push(newUser);
    writeDb(db);
    res.status(201).json(newUser);
});

app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const updatedProject = req.body;

    const dbPath = path.join(__dirname, 'db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const projectIndex = db.projects.findIndex(project => project.id.toString() === id);

    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    db.projects[projectIndex] = { ...db.projects[projectIndex], ...updatedProject };
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.json(db.projects[projectIndex]);
});

app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;

    const dbPath = path.join(__dirname, 'db.json');
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const projectIndex = db.projects.findIndex(project => project.id.toString() === id);

    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    db.projects.splice(projectIndex, 1);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.json({ message: 'Project deleted' });
});

// Route pour l'upload de fichiers
app.post('/api/upload', upload.array('files'), (req, res) => {
    console.log('Requête d\'upload reçue:', req.body);
    console.log('Fichiers reçus:', req.files);
    const files = req.files.map(file => ({
        id: Date.now(), // ou utilisez un ID unique
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: `/uploads/${req.body.userId}/${req.body.projectId}/${req.body.boardId}/${req.body.taskId}/${file.filename}`
    }));


    res.json(files);
});


// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Pour toutes les autres requêtes, renvoyer index.html du frontend
app.use(express.static(path.join(__dirname, 'public')));

// Pour toutes les autres requêtes, renvoyer index.html du frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
});