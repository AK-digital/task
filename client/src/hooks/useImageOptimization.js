"use client";
import { useState, useEffect, useCallback } from "react";

/**
 * Hook pour optimiser le chargement et l'affichage des images
 * Implémente le lazy loading et la gestion d'erreur
 */
export function useImageOptimization() {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [failedImages, setFailedImages] = useState(new Set());

  const handleImageLoad = useCallback((src) => {
    setLoadedImages(prev => new Set([...prev, src]));
  }, []);

  const handleImageError = useCallback((src) => {
    setFailedImages(prev => new Set([...prev, src]));
  }, []);

  const isImageLoaded = useCallback((src) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const isImageFailed = useCallback((src) => {
    return failedImages.has(src);
  }, [failedImages]);

  // Lazy loading avec Intersection Observer
  const setupLazyLoading = useCallback(() => {
    if (typeof window === 'undefined') return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src && !img.src) {
            img.src = src;
            img.onload = () => handleImageLoad(src);
            img.onerror = () => handleImageError(src);
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Charger les images 50px avant qu'elles soient visibles
      threshold: 0.1
    });

    // Observer toutes les images avec data-src
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));

    return () => {
      lazyImages.forEach(img => imageObserver.unobserve(img));
    };
  }, [handleImageLoad, handleImageError]);

  useEffect(() => {
    const cleanup = setupLazyLoading();
    return cleanup;
  }, [setupLazyLoading]);

  return {
    handleImageLoad,
    handleImageError,
    isImageLoaded,
    isImageFailed,
    setupLazyLoading
  };
}

/**
 * Hook pour précharger les images critiques
 */
export function useImagePreloader(imageSources = []) {
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  useEffect(() => {
    if (imageSources.length === 0) return;

    const preloadPromises = imageSources.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setPreloadedImages(prev => new Set([...prev, src]));
          resolve(src);
        };
        img.onerror = reject;
        img.src = src;
      });
    });

    Promise.allSettled(preloadPromises);
  }, [imageSources]);

  return preloadedImages;
}
