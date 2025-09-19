"use server";
import { useAuthFetch } from "@/utils/api";

/**
 * Créer une erreur d'action optimisée
 */
export async function createActionError(message, code, details = null) {
  const error = new Error(message);
  error.name = 'ActionError';
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Wrapper optimisé pour les actions avec gestion d'erreur standardisée
 */
export async function withErrorHandling(actionFn, errorContext = 'action') {
  try {
    return await actionFn();
  } catch (err) {
    // Ne pas logger en production
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[${errorContext}]`, err);
    }

    // Gestion spécifique des erreurs courantes
    if (err.message?.includes('E11000')) {
      return {
        status: "failure",
        message: "Cette ressource existe déjà",
        code: 'DUPLICATE_RESOURCE',
      };
    }

    if (err.message?.includes('mail')) {
      return {
        status: "failure",
        message: "Adresse e-mail invalide",
        code: 'INVALID_EMAIL',
        errors: { email: "Cette adresse e-mail n'est pas valide" },
      };
    }

    if (err.message?.includes('passe')) {
      return {
        status: "failure",
        message: "Mot de passe invalide",
        code: 'INVALID_PASSWORD',
        errors: { password: "Mot de passe incorrect" },
      };
    }

    // Erreur générique
    return {
      status: "failure",
      message: err.message || `Une erreur est survenue lors de ${errorContext}`,
      code: 'GENERIC_ERROR',
    };
  }
}

/**
 * Validation optimisée avec cache
 */
export async function optimizedValidation(schema, data, cacheKey = null) {
  // Cache en mémoire pour cette session
  if (!global.validationCache) {
    global.validationCache = new Map();
  }
  
  const validationCache = global.validationCache;
  if (cacheKey && validationCache.has(cacheKey)) {
    const cachedResult = validationCache.get(cacheKey);
    // Vérifier si les données sont identiques
    if (JSON.stringify(cachedResult.data) === JSON.stringify(data)) {
      return cachedResult.result;
    }
  }

  const result = schema.safeParse(data);
  
  if (cacheKey) {
    validationCache.set(cacheKey, { data, result });
    
    // Nettoyer le cache après 5 minutes
    setTimeout(() => {
      validationCache.delete(cacheKey);
    }, 5 * 60 * 1000);
  }

  return result;
}

/**
 * Appel API optimisé avec retry et timeout
 */
export async function optimizedApiCall(
  endpoint, 
  method = 'GET', 
  contentType = 'application/json', 
  data = null,
  options = {}
) {
  const {
    retries = 3,
    timeout = 10000,
    backoffMultiplier = 1.5,
  } = options;

  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Créer une promesse avec timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      const apiPromise = useAuthFetch(endpoint, method, contentType, data);
      
      // Course entre l'API et le timeout
      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      // Si la réponse est OK, la retourner
      if (response.ok || response.status < 500) {
        return response;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      lastError = error;
      
      // Ne pas retry sur les erreurs client (4xx)
      if (error.message?.includes('4')) {
        throw error;
      }
      
      // Si c'est la dernière tentative, throw l'erreur
      if (attempt === retries) {
        throw error;
      }
      
      // Attendre avant le prochain retry (backoff exponentiel)
      const delay = Math.min(1000 * Math.pow(backoffMultiplier, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Compression des données pour les gros payloads
 */
export async function compressData(data) {
  if (typeof data === 'string' && data.length > 1000) {
    // Pour les chaînes longues, on peut implémenter une compression simple
    return {
      compressed: true,
      data: data, // En production, utiliser une vraie compression
    };
  }
  
  return { compressed: false, data };
}

/**
 * Décompression des données
 */
export async function decompressData(compressedData) {
  if (compressedData.compressed) {
    return compressedData.data; // En production, décompresser
  }
  
  return compressedData.data;
}

/**
 * Créer un batch processor pour les opérations
 */
export async function createBatchProcessor(batchSize = 10, delay = 100) {
  return {
    batchSize,
    delay,
    queue: [],
    processing: false,
    
    async add(operation) {
      return new Promise((resolve, reject) => {
        this.queue.push({ operation, resolve, reject });
        this.process();
      });
    },

    async process() {
      if (this.processing || this.queue.length === 0) return;
      
      this.processing = true;
      
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        
        try {
          // Exécuter toutes les opérations du batch en parallèle
          const results = await Promise.allSettled(
            batch.map(item => item.operation())
          );
          
          // Résoudre/rejeter chaque promesse
          results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              batch[index].resolve(result.value);
            } else {
              batch[index].reject(result.reason);
            }
          });
          
        } catch (error) {
          // En cas d'erreur globale, rejeter toutes les promesses du batch
          batch.forEach(item => item.reject(error));
        }
        
        // Attendre avant le prochain batch
        if (this.queue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
      }
      
      this.processing = false;
    }
  };
}

/**
 * Obtenir l'instance globale du batch processor
 */
export async function getGlobalBatchProcessor() {
  if (!global.batchProcessor) {
    global.batchProcessor = await createBatchProcessor();
  }
  return global.batchProcessor;
}

/**
 * Helper pour créer des actions optimisées
 */
export async function createOptimizedAction(actionName, actionFn) {
  return async function(prevState, formData) {
    return withErrorHandling(
      () => actionFn(prevState, formData),
      actionName
    );
  };
}
