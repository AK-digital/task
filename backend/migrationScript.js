// migrationScript.js
const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');

// Vérifier si Firebase Admin est déjà initialisé
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function migrateUserToFirestore() {
    try {
        const db = admin.firestore();
        const data = JSON.parse(fs.readFileSync('./db.json', 'utf8'));
        const user = data.users.find(u => u.email === 'aurelien@akdigital.fr');

        if (user) {
            // Récupérer l'utilisateur Firebase existant
            const userRecord = await admin.auth().getUserByEmail(user.email);

            // Mettre à jour le document utilisateur dans Firestore
            await db.collection('users').doc(userRecord.uid).set({
                id: userRecord.uid,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                currentProjectId: user.currentProjectId
            }, { merge: true });

            // Migrer les projets associés
            const userProjects = data.projects.filter(p => p.userId === user.id);
            for (const project of userProjects) {
                await db.collection('projects').doc(project.id).set({
                    ...project,
                    userId: userRecord.uid
                }, { merge: true });
            }

            console.log('Migration réussie!', {
                userId: userRecord.uid,
                projectsMigrated: userProjects.length
            });
        }
    } catch (error) {
        console.error('Erreur de migration:', error);
    } finally {
        process.exit();
    }
}

migrateUserToFirestore();