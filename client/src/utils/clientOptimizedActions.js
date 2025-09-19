"use client";

/**
 * Version client des utilitaires d'optimisation
 */

/**
 * Batch des opérations pour réduire les appels API (côté client)
 */
export class BatchProcessor {
  constructor(batchSize = 10, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.processing = false;
  }

  async add(operation) {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.process();
    });
  }

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
}

// Instance globale du batch processor (côté client)
export const globalBatchProcessor = new BatchProcessor();
