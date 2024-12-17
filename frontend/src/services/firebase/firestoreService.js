import {
    collection,
    doc,
    query,
    where,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export const firestoreService = {
    // Projets
    async getProjects(userId) {
        try {
            const projectsQuery = query(
                collection(db, 'projects'),
                where('userId', '==', userId)
            );
            const guestProjectsQuery = query(
                collection(db, 'projects'),
                where('guestUsers', 'array-contains', userId)
            );

            const [projectsSnapshot, guestProjectsSnapshot] = await Promise.all([
                getDocs(projectsQuery),
                getDocs(guestProjectsQuery)
            ]);

            const projects = [
                ...projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...guestProjectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            ];

            return projects;
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    async createProject(projectData) {
        try {
            const projectRef = doc(collection(db, 'projects'));
            const project = {
                ...projectData,
                id: projectRef.id,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(projectRef, project);
            return project;
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    async updateProject(projectId, data) {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const updates = {
                ...data,
                updatedAt: serverTimestamp()
            };
            await updateDoc(projectRef, updates);
            return { id: projectId, ...updates };
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    async deleteProject(projectId) {
        try {
            await deleteDoc(doc(db, 'projects', projectId));
            return projectId;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    },

    // Tâches
    async updateTask(projectId, boardId, taskId, updates) {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const projectDoc = await getDoc(projectRef);

            if (!projectDoc.exists()) {
                throw new Error('Project not found');
            }

            const projectData = projectDoc.data();
            const updatedBoards = projectData.boards.map(board => {
                if (board.id === boardId) {
                    return {
                        ...board,
                        tasks: board.tasks.map(task =>
                            task.id === taskId ? { ...task, ...updates, updatedAt: serverTimestamp() } : task
                        )
                    };
                }
                return board;
            });

            await updateDoc(projectRef, {
                boards: updatedBoards,
                updatedAt: serverTimestamp()
            });

            return updates;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // Notifications
    async createNotification(notification) {
        try {
            const notificationRef = doc(collection(db, 'notifications'));
            const notificationData = {
                id: notificationRef.id,
                ...notification,
                createdAt: serverTimestamp(),
                seen: false
            };
            await setDoc(notificationRef, notificationData);
            return notificationData;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    async getUserNotifications(userId) {
        try {
            const notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId)
            );
            const snapshot = await getDocs(notificationsQuery);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }
};

export default firestoreService;