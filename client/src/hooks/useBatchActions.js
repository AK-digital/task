"use client";
import { useState, useCallback, useRef } from "react";
import { globalBatchProcessor } from "@/utils/clientOptimizedActions";

/**
 * Hook pour gérer les actions en lot de manière optimisée
 */
export function useBatchActions() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const [errors, setErrors] = useState([]);
  const pendingActions = useRef([]);

  // Ajouter une action au batch
  const addAction = useCallback((actionFn, metadata = {}) => {
    const actionId = Date.now() + Math.random();
    
    pendingActions.current.push({
      id: actionId,
      action: actionFn,
      metadata,
    });

    return actionId;
  }, []);

  // Exécuter toutes les actions en batch
  const executeBatch = useCallback(async () => {
    if (pendingActions.current.length === 0) return;
    
    setIsProcessing(true);
    setResults([]);
    setErrors([]);

    try {
      const batchPromises = pendingActions.current.map(async ({ id, action, metadata }) => {
        try {
          const result = await globalBatchProcessor.add(action);
          return { id, result, metadata, success: true };
        } catch (error) {
          return { id, error, metadata, success: false };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      const successResults = [];
      const errorResults = [];

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            successResults.push(result.value);
          } else {
            errorResults.push(result.value);
          }
        } else {
          errorResults.push({
            id: 'unknown',
            error: result.reason,
            success: false,
          });
        }
      });

      setResults(successResults);
      setErrors(errorResults);
      
      // Nettoyer les actions en attente
      pendingActions.current = [];

      return {
        success: successResults.length,
        errors: errorResults.length,
        total: batchResults.length,
      };

    } catch (error) {
      setErrors([{ id: 'batch', error, success: false }]);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Nettoyer les actions en attente
  const clearBatch = useCallback(() => {
    pendingActions.current = [];
    setResults([]);
    setErrors([]);
  }, []);

  // Obtenir le nombre d'actions en attente
  const getPendingCount = useCallback(() => {
    return pendingActions.current.length;
  }, []);

  return {
    addAction,
    executeBatch,
    clearBatch,
    getPendingCount,
    isProcessing,
    results,
    errors,
    hasPendingActions: pendingActions.current.length > 0,
  };
}

/**
 * Hook spécialisé pour les actions de tâches en lot
 */
export function useBatchTaskActions() {
  const batchActions = useBatchActions();

  const updateMultipleStatuses = useCallback(async (taskUpdates) => {
    taskUpdates.forEach(({ taskId, projectId, statusId, type = 'task' }) => {
      batchActions.addAction(
        async () => {
          const { updateStatus } = await import('@/actions/unified');
          return updateStatus(taskId, projectId, statusId, type);
        },
        { type: 'status', taskId, statusId }
      );
    });

    return batchActions.executeBatch();
  }, [batchActions]);

  const updateMultiplePriorities = useCallback(async (taskUpdates) => {
    taskUpdates.forEach(({ taskId, projectId, priorityId, type = 'task' }) => {
      batchActions.addAction(
        async () => {
          const { updatePriority } = await import('@/actions/unified');
          return updatePriority(taskId, projectId, priorityId, type);
        },
        { type: 'priority', taskId, priorityId }
      );
    });

    return batchActions.executeBatch();
  }, [batchActions]);

  const assignMultipleUsers = useCallback(async (assignments) => {
    assignments.forEach(({ taskId, projectId, userId, type = 'task' }) => {
      batchActions.addAction(
        async () => {
          const { addResponsible } = await import('@/actions/unified');
          return addResponsible(taskId, projectId, userId, type);
        },
        { type: 'assign', taskId, userId }
      );
    });

    return batchActions.executeBatch();
  }, [batchActions]);

  return {
    ...batchActions,
    updateMultipleStatuses,
    updateMultiplePriorities,
    assignMultipleUsers,
  };
}
