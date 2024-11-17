// initFirestore.js

const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');

// Initialiser Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeDatabase() {
    try {
        // Collection Projects
        const projectsRef = db.collection('projects');
        await projectsRef.doc('demo-project').set({
            name: "täsk, a better monday (démo)",
            userId: "da78",
            guestUsers: [],
            boards: [
                {
                    id: "board1",
                    title: "UX / UI",
                    titleColor: "#ffffff",
                    tasks: []
                }
            ]
        });

        // Collection Users
        const usersRef = db.collection('users');
        await usersRef.doc('da78').set({
            name: "Aurélien",
            email: "aurelien@akdigital.fr",
            authToken: "",
            profilePicture: "aurelien.jpg",
            currentProjectId: "demo-project"
        });

        // Collection Uploads
        const uploadsRef = db.collection('uploads');
        await uploadsRef.doc('example').set({
            files: []
        });

        console.log('Base de données initialisée avec succès !');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
}

// migrationScript.js
async function migrateData() {
    try {
        // Lire db.json
        const data = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

        // Trouver l'utilisateur
        const user = data.users.find(u => u.email === 'aurelien@akdigital.fr');

        if (!user) {
            throw new Error('Utilisateur non trouvé');
        }

        // Trouver les projets de l'utilisateur
        const userProjects = data.projects.filter(p => p.userId === user.id);

        // Créer l'utilisateur dans Firestore
        await db.collection('users').doc(user.id).set({
            name: user.name,
            email: user.email,
            authToken: user.authToken || '',
            profilePicture: user.profilePicture || 'default-profile-pic.svg',
            currentProjectId: userProjects[0]?.id || null
        });

        // Migrer les projets
        for (const project of userProjects) {
            await db.collection('projects').doc(project.id).set({
                name: project.name,
                userId: project.userId,
                guestUsers: project.guestUsers || [],
                boards: project.boards.map(board => ({
                    id: board.id,
                    title: board.title,
                    titleColor: board.titleColor || '#ffffff',
                    tasks: board.tasks || []
                }))
            });
        }

        console.log('Migration réussie !');
        console.log(`Utilisateur migré : ${user.email}`);
        console.log(`Nombre de projets migrés : ${userProjects.length}`);

    } catch (error) {
        console.error('Erreur lors de la migration:', error);
    } finally {
        process.exit();
    }
}

migrateData();

// Exécuter l'initialisation
initializeDatabase();