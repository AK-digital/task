import React, { useEffect } from 'react';

const Head = ({ title, description, keywords }) => {
    useEffect(() => {
        // Sauvegarder le titre original
        const originalTitle = document.title;

        // Mettre à jour le titre
        if (title) {
            document.title = `${title} | täsk`;
        }

        // Mettre à jour ou créer la meta description
        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.name = 'description';
                document.head.appendChild(metaDescription);
            }
            metaDescription.content = description;
        }

        // Mettre à jour ou créer la meta keywords
        if (keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = 'keywords';
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.content = keywords;
        }

        // Cleanup
        return () => {
            document.title = originalTitle;
        };
    }, [title, description, keywords]);

    return null;
};

export default Head;