import React, { useEffect } from 'react';

const FontLoader = () => {
    useEffect(() => {
        // Créer les éléments link dynamiquement
        const links = [
            {
                rel: "preconnect",
                href: "https://fonts.googleapis.com"
            },
            {
                rel: "preconnect",
                href: "https://fonts.gstatic.com",
                crossOrigin: "true"
            },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap"
            }
        ];

        // Ajouter les liens au head
        links.forEach(linkData => {
            const link = document.createElement('link');
            Object.entries(linkData).forEach(([key, value]) => {
                link.setAttribute(key, value);
            });
            document.head.appendChild(link);
        });

        // Cleanup
        return () => {
            // Retirer les liens quand le composant est démonté
            document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => {
                link.parentNode.removeChild(link);
            });
        };
    }, []); // Dépendances vides = s'exécute une seule fois au montage

    return null;
};

export default FontLoader;