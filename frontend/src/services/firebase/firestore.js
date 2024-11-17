
// src/services/firebase/firestore.js
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
    arrayRemove
} from 'firebase/firestore';
import { db } from '@/config/firebase';

export const firestoreService = {
    // Projets
    async getProjects(userId) {
        const q = query(collection(db, 'projects'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async createProject(projectData) {
        const projectRef = doc(collection(db, 'projects'));
        await setDoc(projectRef, { id: projectRef.id, ...projectData });
        return { id: projectRef.id, ...projectData };
    },

    async updateProject(projectId, data) {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, data);
        return { id: projectId, ...data };
    },

    async deleteProject(projectId) {
        await deleteDoc(doc(db, 'projects', projectId));
    },

    // Notifications
    async createNotification(notification) {
        const notificationRef = doc(collection(db, 'notifications'));
        await setDoc(notificationRef, {
            id: notificationRef.id,
            ...notification,
            date: new Date(),
            seen: false
        });
        return notificationRef.id;
    },

    async getUserNotifications(userId) {
        const q = query(collection(db, 'notifications'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};