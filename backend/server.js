const express = require('express');
const jsonServer = require('json-server');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');

const app = express();
const port = 5000;

// Configuration de json-server
const jsonServerRouter = jsonServer.router('db.json');
const jsonServerMiddlewares = jsonServer.defaults();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Utiliser json-server comme middleware
app.use('/api', jsonServerMiddlewares, jsonServerRouter);

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

const upload = multer({ storage: storage });

app.post('/api/upload', upload.array('files'), (req, res) => {
    const files = req.files.map(file => ({
        name: file.originalname,
        url: `/uploads/${req.body.userId}/${req.body.projectId}/${req.body.boardId}/${req.body.taskId}/${file.filename}`,
        size: file.size,
        type: file.mimetype
    }));
    res.json(files);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
