// services/notification.service.js
import { db } from '../config/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc
} from 'firebase/firestore';

export const notificationService = {
    /**
     * Crée une nouvelle notification
     */
    async createNotification({ userId, title, description, task, type = 'info' }) {
        try {
            const notificationRef = collection(db, 'notifications');
            const notification = {
                userId,
                title,
                description,
                task,
                type,
                date: new Date().toISOString(),
                seen: false
            };

            const docRef = await addDoc(notificationRef, notification);
            return { id: docRef.id, ...notification };
        } catch (error) {
            console.error('Erreur lors de la création de la notification:', error);
            throw error;
        }
    },

    /**
     * Récupère les notifications d'un utilisateur
     */
    async getUserNotifications(userId) {
        try {
            const q = query(
                collection(db, 'notifications'),
                where('userId', '==', userId)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des notifications:', error);
            throw error;
        }
    },

    /**
     * Marque une notification comme vue
     */
    async markAsSeen(notificationId) {
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                seen: true,
                seenAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Erreur lors du marquage de la notification:', error);
            throw error;
        }
    },

    /**
     * Crée une notification pour une tâche assignée
     */
    async notifyTaskAssignment({ taskId, assignerId, assigneeId, taskTitle }) {
        return this.createNotification({
            userId: assigneeId,
            title: 'Nouvelle tâche assignée',
            description: `Une nouvelle tâche vous a été assignée par ${assignerId}`,
            task: taskTitle,
            type: 'task_assignment'
        });
    },

    /**
     * Crée une notification pour un commentaire mentionnant l'utilisateur
     */
    async notifyMention({ taskId, mentionedById, mentionedUserId, taskTitle, commentText }) {
        return this.createNotification({
            userId: mentionedUserId,
            title: 'Mention dans un commentaire',
            description: `Vous avez été mentionné dans un commentaire`,
            task: taskTitle,
            type: 'mention',
            metadata: {
                taskId,
                commentText: commentText.substring(0, 100),
                mentionedBy: mentionedById
            }
        });
    }
};