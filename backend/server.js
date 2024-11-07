const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const cors = require("cors");

const mailRouter = require("./routes/mail.routes");
const { randomUUID } = require("crypto");

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS
const corsOptions = {
	origin: [
		"https://task.akdigital.fr",
		"http://localhost:5173",
		"http://localhost:3000",
	],
	optionsSuccessStatus: 200,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};
app.use(cors(corsOptions));

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Servir les fichiers statiques
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "public")));
}

// Configuration de la base de données
const dbPath = process.env.DB_PATH || path.join(__dirname, "db.json");

function readDb() {
	return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(data) {
	fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
}
// Configuration de Multer pour l'upload de fichiers
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const { userId, projectId, boardId, taskId } = req.body;
		const dir = path.join(
			__dirname,
			"uploads",
			userId,
			projectId,
			boardId,
			taskId
		);
		fs.ensureDirSync(dir);
		cb(null, dir);
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(
			null,
			file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
		);
	},
});

const upload = multer({ storage: storage });

// Servir les fichiers uploadés
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes API génériques

app.use("/api", mailRouter);

app.get("/api/:resource", (req, res) => {
	const db = readDb();
	const resource = req.params.resource;
	if (db[resource]) {
		res.json(db[resource]);
	} else {
		res.status(404).json({ error: "Resource not found" });
	}
});

app.post("/api/:resource", (req, res) => {
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
app.get("/api/users", (req, res) => {
	const { authToken } = req.query;

	if (!authToken) {
		return res.status(400).json({ error: "Token d'authentification manquant" });
	}
	const db = readDb();
	const users = db.users.filter((user) => user.authToken === authToken);
	res.json(users);
});

app.get("/api/users/by-email", (req, res) => {
	const { email } = req.query;
	if (!email) {
		return res.status(400).json({ error: "Email manquant." });
	}
	const db = readDb();
	const user = db.users.find((u) => u.email === email);
	if (user) {
		res.json([user]);
	} else {
		res.status(404).json({ error: "Utilisateur non trouvé." });
	}
});

app.put("/api/users/:id", (req, res) => {
	const db = readDb();
	const { id } = req.params;
	const userIndex = db.users.findIndex((u) => u.id === id);
	if (userIndex !== -1) {
		db.users[userIndex] = { ...db.users[userIndex], ...req.body };
		writeDb(db);
		res.json(db.users[userIndex]);
	} else {
		res.status(404).json({ error: "User not found" });
	}
});

app.patch("/api/users/:id", (req, res) => {
	const { id } = req.params;
	const updates = req.body;
	const db = readDb();
	const userIndex = db.users.findIndex((user) => user.id === id);
	if (userIndex === -1) {
		return res.status(404).json({ error: "Utilisateur non trouvé" });
	}
	db.users[userIndex] = { ...db.users[userIndex], ...updates };
	writeDb(db);
	res.json(db.users[userIndex]);
});

// Notifications routes
app.patch("/api/notifications/:id", (req, res) => {
	try {
		const db = readDb();
		const notifications = db?.notifications;
		const findIndex = notifications?.findIndex(
			(notification) => notification?.id === req.params.id
		);

		const notification = notifications[findIndex];

		notification.seen = true;

		writeDb(db);

		res.status(200).send(notification);
	} catch (err) {
		return res.status(200).send({
			error: true,
			message: err?.message || "An unexpected error has occurred",
		});
	}
});

// Routes pour les projets
app.put("/api/projects/:id", (req, res) => {
	const { id } = req.params;
	const updatedProject = req.body;
	const db = readDb();
	const projectIndex = db.projects.findIndex((project) => project.id === id);
	if (projectIndex === -1) {
		return res.status(404).json({ error: "Project not found" });
	}
	db.projects[projectIndex] = {
		...db.projects[projectIndex],
		...updatedProject,
	};
	writeDb(db);
	res.json(db.projects[projectIndex]);
});

app.patch("/api/projects/add-task-seen/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { taskId, userId } = req.body;
		const db = readDb();
		const project = db.projects.find((project) => project.id === id);

		if (!project) {
			return res
				.status(404)
				.send({ error: true, message: "Project not found" });
		}

		for (const board of project.boards) {
			const task = board?.tasks.find((task) => task?.id === taskId);
			if (!task?.seenBy?.includes(userId)) {
				task?.seenBy?.push(userId);
				writeDb(db);
			} else {
				return res.status(400).send({
					error: true,
					message: "This user has already viewed the task",
				});
			}
		}

		return res.status(200).send({
			error: false,
			message: "User added to the seenBy array",
		});
	} catch (err) {
		return res.status(500).send({
			error: true,
			message: "An unexpected error has occurred",
		});
	}
});

app.patch("/api/projects/add-response-seen/:id", (req, res) => {
	try {
		const { id } = req.params;
		const { taskId, responseId, userId } = req.body;
		const db = readDb();
		const project = db.projects.find((project) => project.id === id);

		if (!project) {
			return res
				.status(404)
				.send({ error: true, message: "Project not found" });
		}

		for (const board of project.boards) {
			const task = board?.tasks.find((task) => task?.id === taskId);
			const response = task?.responses.find(
				(response) => response.id === responseId
			);
			console.log(response);
			if (!response?.seenBy?.includes(userId)) {
				response?.seenBy?.push(userId);
				writeDb(db);
			} else {
				return res.status(400).send({
					error: true,
					message: "This user has already viewed the response",
				});
			}
		}

		return res.status(200).send({
			error: false,
			message: "User added to the seenBy array",
		});
	} catch (err) {
		return res.status(500).send({
			error: true,
			message: "An unexpected error has occurred",
		});
	}
});

app.delete("/api/projects/:id", (req, res) => {
	const { id } = req.params;
	const db = readDb();
	const projectIndex = db.projects.findIndex((project) => project.id === id);
	if (projectIndex === -1) {
		return res.status(404).json({ error: "Project not found" });
	}
	db.projects.splice(projectIndex, 1);
	writeDb(db);
	res.json({ message: "Project deleted" });
});

// Route pour l'upload de fichiers
app.post("/upload", upload.array("files"), (req, res) => {
	try {
		console.log("Requête d'upload reçue");
		console.log("Corps de la requête:", req.body);
		console.log("Fichiers reçus:", req.files);

		if (!req.files || req.files.length === 0) {
			console.log("Aucun fichier reçu");
			return res.status(400).json({ error: "Aucun fichier n'a été uploadé." });
		}

		const files = req.files.map((file) => {
			return {
				id: Date.now() + "-" + Math.random().toString(36).substr(2, 9),
				name: file.originalname,
				size: file.size,
				type: file.mimetype,
				url: `/uploads/${req.body.userId}/${req.body.projectId}/${req.body.boardId}/${req.body.taskId}/${file.filename}`,
			};
		});

		console.log("Fichiers traités:", files);

		// Ajout des informations des fichiers à db.json
		const db = readDb();
		if (!db.upload) {
			db.upload = [];
		}
		db.upload.push(...files);
		writeDb(db);

		console.log("Réponse envoyée:", files);
		return res.status(201).json(files);
	} catch (error) {
		console.error("Erreur lors de l'upload:", error);
		return res
			.status(500)
			.json({ error: "Une erreur est survenue lors de l'upload" });
	}
});

// Gestion des erreurs
app.use((err, req, res, next) => {
	console.error("Erreur globale :", err);
	res
		.status(500)
		.json({ error: "Une erreur est survenue", details: err.message });
});

// Route catch-all pour le frontend
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Démarrage du serveur
app.listen(port, () => {
	console.log(
		`Server running on port ${port} in ${
			process.env.NODE_ENV || "development"
		} mode`
	);
});
