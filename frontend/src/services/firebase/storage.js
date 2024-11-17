// src/services/firebase/storage.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

export const storageService = {
    async uploadFile(file, path) {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return {
            url: downloadURL,
            path: snapshot.ref.fullPath,
            name: file.name,
            type: file.type,
            size: file.size
        };
    },

    async uploadFiles(files, basePath) {
        const uploadPromises = files.map(file => {
            const filePath = `${basePath}/${file.name}`;
            return this.uploadFile(file, filePath);
        });
        return Promise.all(uploadPromises);
    }
};