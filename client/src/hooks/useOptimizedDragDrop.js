"use client";
import { useCallback, useRef, useMemo } from "react";
import { useOptimizedDebounce } from "./useOptimizedDebounce";

/**
 * Hook optimisé pour le drag and drop avec throttling et batching
 * Améliore les performances lors du déplacement de nombreux éléments
 */
export function useOptimizedDragDrop({
  onDragStart,
  onDragOver,
  onDragEnd,
  throttleDelay = 16, // ~60fps
  batchDelay = 100,
}) {
  const dragStateRef = useRef({
    isDragging: false,
    activeId: null,
    overContainer: null,
    startTime: null,
  });

  const pendingUpdatesRef = useRef([]);

  // Batching des mises à jour pour éviter les re-renders excessifs
  const flushUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.length > 0) {
      const updates = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];
      
      // Appliquer toutes les mises à jour en une seule fois
      updates.forEach(update => update());
    }
  }, []);

  const debouncedFlush = useOptimizedDebounce(flushUpdates, batchDelay);

  // Optimiser onDragStart avec mémorisation
  const optimizedDragStart = useCallback((event) => {
    const startTime = performance.now();
    dragStateRef.current = {
      isDragging: true,
      activeId: event.active.id,
      overContainer: null,
      startTime,
    };

    // Appeler le callback original
    onDragStart?.(event);
  }, [onDragStart]);

  // Throttler onDragOver pour éviter les calculs excessifs
  const lastDragOverTime = useRef(0);
  const optimizedDragOver = useCallback((event) => {
    const now = performance.now();
    
    // Throttling basé sur le temps
    if (now - lastDragOverTime.current < throttleDelay) {
      return;
    }
    
    lastDragOverTime.current = now;
    
    // Mettre à jour l'état de drag
    const overContainer = event.over?.id;
    if (dragStateRef.current.overContainer !== overContainer) {
      dragStateRef.current.overContainer = overContainer;
      
      // Batcher la mise à jour
      pendingUpdatesRef.current.push(() => {
        onDragOver?.(event);
      });
      
      debouncedFlush();
    }
  }, [onDragOver, throttleDelay, debouncedFlush]);

  // Optimiser onDragEnd avec nettoyage
  const optimizedDragEnd = useCallback((event) => {
    const endTime = performance.now();
    const dragDuration = endTime - (dragStateRef.current.startTime || endTime);
    
    // Nettoyer l'état
    dragStateRef.current = {
      isDragging: false,
      activeId: null,
      overContainer: null,
      startTime: null,
    };

    // Vider les mises à jour en attente
    flushUpdates();
    
    // Appeler le callback original avec des métriques
    onDragEnd?.({
      ...event,
      dragDuration,
    });
  }, [onDragEnd, flushUpdates]);

  // Mémoriser les sensors optimisés
  const optimizedSensors = useMemo(() => ({
    onDragStart: optimizedDragStart,
    onDragOver: optimizedDragOver,
    onDragEnd: optimizedDragEnd,
  }), [optimizedDragStart, optimizedDragOver, optimizedDragEnd]);

  // Utilitaires pour les composants
  const getDragState = useCallback(() => ({
    ...dragStateRef.current,
  }), []);

  const isDragging = useCallback((id) => {
    return dragStateRef.current.activeId === id;
  }, []);

  return {
    sensors: optimizedSensors,
    getDragState,
    isDragging,
    flushUpdates,
  };
}

/**
 * Hook pour optimiser les éléments draggables
 */
export function useOptimizedDraggable(id, data = {}) {
  const elementRef = useRef(null);
  
  // Mémoriser les propriétés de l'élément draggable
  const draggableProps = useMemo(() => ({
    id,
    data: {
      type: data.type || 'default',
      ...data,
    },
  }), [id, data]);

  // Optimiser les styles de drag
  const getDragStyles = useCallback((transform, transition, isDragging) => {
    if (!isDragging) return {};

    return {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      transition,
      zIndex: 1000,
      opacity: 0.8,
      willChange: 'transform',
    };
  }, []);

  return {
    draggableProps,
    getDragStyles,
    elementRef,
  };
}

/**
 * Hook pour optimiser les zones de drop
 */
export function useOptimizedDroppable(id, data = {}) {
  const dropZoneRef = useRef(null);
  
  // Mémoriser les propriétés de la zone de drop
  const droppableProps = useMemo(() => ({
    id,
    data: {
      type: data.type || 'default',
      accepts: data.accepts || [],
      ...data,
    },
  }), [id, data]);

  // Optimiser les styles de drop zone
  const getDropStyles = useCallback((isOver, canDrop) => {
    if (!isOver && !canDrop) return {};

    return {
      backgroundColor: isOver && canDrop ? 'rgba(59, 130, 246, 0.1)' : undefined,
      borderColor: isOver && canDrop ? '#3b82f6' : undefined,
      transition: 'all 150ms ease-in-out',
    };
  }, []);

  return {
    droppableProps,
    getDropStyles,
    dropZoneRef,
  };
}
