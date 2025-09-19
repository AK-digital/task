"use client";

// Configuration globale SWR optimisée pour les performances
export const swrConfig = {
  // Cache plus agressif
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  revalidateIfStale: true,
  
  // Délais optimisés
  focusThrottleInterval: 5000,
  dedupingInterval: 2000,
  
  // Retry avec backoff exponentiel
  errorRetryInterval: 5000,
  errorRetryCount: 3,
  
  // Cache persistant
  provider: () => {
    // Utiliser Map pour un cache en mémoire plus performant
    const map = new Map();
    
    // Ajouter une logique de nettoyage automatique
    const cleanup = () => {
      const now = Date.now();
      const maxAge = 10 * 60 * 1000; // 10 minutes
      
      for (const [key, value] of map.entries()) {
        if (value.timestamp && now - value.timestamp > maxAge) {
          map.delete(key);
        }
      }
    };
    
    // Nettoyer le cache toutes les 5 minutes
    setInterval(cleanup, 5 * 60 * 1000);
    
    return map;
  },
  
  // Optimisation pour les listes longues
  compare: (a, b) => {
    // Comparaison rapide pour les arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      
      // Comparaison par référence pour les premiers éléments
      for (let i = 0; i < Math.min(a.length, 10); i++) {
        if (a[i]?._id !== b[i]?._id) return false;
      }
      return true;
    }
    
    // Comparaison par défaut
    return a === b;
  },
  
  // Fonction de sérialisation optimisée
  serialize: (key) => {
    if (typeof key === 'string') return key;
    if (Array.isArray(key)) {
      return key.map(k => typeof k === 'object' ? JSON.stringify(k) : k).join('|');
    }
    return JSON.stringify(key);
  },
};

// Hook personnalisé pour les requêtes avec cache intelligent
export function useOptimizedSWR(key, fetcher, options = {}) {
  const optimizedOptions = {
    ...swrConfig,
    ...options,
    
    // Cache conditionnel basé sur la taille des données
    revalidateOnMount: (data) => {
      if (!data) return true;
      
      // Si les données sont volumineuses, éviter la revalidation immédiate
      if (Array.isArray(data) && data.length > 100) {
        return false;
      }
      
      return options.revalidateOnMount !== false;
    },
  };
  
  return useSWR(key, fetcher, optimizedOptions);
}

// Préchargement intelligent des données
export function preloadData(key, fetcher) {
  return mutate(key, fetcher(key), false);
}

// Invalidation sélective du cache
export function invalidateRelatedCache(pattern) {
  const cache = swrConfig.provider();
  const keysToInvalidate = [];
  
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      keysToInvalidate.push(key);
    }
  }
  
  keysToInvalidate.forEach(key => {
    mutate(key, undefined, true);
  });
}
