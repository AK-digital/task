"use client";
import { useState, useEffect, useMemo, useCallback } from "react";

/**
 * Hook pour la virtualisation des listes longues
 * Améliore les performances en ne rendant que les éléments visibles
 */
export function useVirtualizedList({
  items = [],
  itemHeight = 40,
  containerHeight = 400,
  overscan = 5, // Nombre d'éléments à rendre en plus pour le scroll fluide
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Calculer les indices des éléments visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Éléments visibles à rendre
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      ...item,
      index: visibleRange.startIndex + index,
      style: {
        position: 'absolute',
        top: (visibleRange.startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%',
      },
    }));
  }, [items, visibleRange, itemHeight]);

  // Gestionnaire de scroll avec debouncing
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    if (!isScrolling) {
      setIsScrolling(true);
    }

    // Debounce pour détecter la fin du scroll
    const timeoutId = setTimeout(() => {
      setIsScrolling(false);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [isScrolling]);

  // Hauteur totale du conteneur virtuel
  const totalHeight = items.length * itemHeight;

  // Propriétés du conteneur
  const containerProps = {
    style: {
      height: containerHeight,
      overflowY: 'auto',
      position: 'relative',
    },
    onScroll: handleScroll,
  };

  // Propriétés du conteneur interne
  const innerProps = {
    style: {
      height: totalHeight,
      position: 'relative',
    },
  };

  return {
    visibleItems,
    containerProps,
    innerProps,
    isScrolling,
    totalHeight,
    visibleRange,
  };
}

/**
 * Hook pour la virtualisation avec taille d'éléments dynamique
 */
export function useDynamicVirtualizedList({
  items = [],
  estimatedItemHeight = 40,
  containerHeight = 400,
  overscan = 5,
}) {
  const [itemHeights, setItemHeights] = useState(new Map());
  const [scrollTop, setScrollTop] = useState(0);

  // Calculer les positions cumulées
  const itemPositions = useMemo(() => {
    const positions = [];
    let totalHeight = 0;

    items.forEach((_, index) => {
      positions[index] = totalHeight;
      const height = itemHeights.get(index) || estimatedItemHeight;
      totalHeight += height;
    });

    return { positions, totalHeight };
  }, [items, itemHeights, estimatedItemHeight]);

  // Trouver les éléments visibles
  const visibleRange = useMemo(() => {
    const { positions } = itemPositions;
    
    let startIndex = 0;
    let endIndex = items.length - 1;

    // Recherche binaire pour trouver le premier élément visible
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] >= scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
    }

    // Trouver le dernier élément visible
    for (let i = startIndex; i < positions.length; i++) {
      if (positions[i] > scrollTop + containerHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, overscan, itemPositions, items.length]);

  // Callback pour mesurer la hauteur d'un élément
  const measureItem = useCallback((index, height) => {
    setItemHeights(prev => {
      const newHeights = new Map(prev);
      newHeights.set(index, height);
      return newHeights;
    });
  }, []);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => {
      const actualIndex = visibleRange.startIndex + index;
      return {
        ...item,
        index: actualIndex,
        style: {
          position: 'absolute',
          top: itemPositions.positions[actualIndex],
          width: '100%',
        },
      };
    });
  }, [items, visibleRange, itemPositions]);

  return {
    visibleItems,
    measureItem,
    containerProps: {
      style: {
        height: containerHeight,
        overflowY: 'auto',
        position: 'relative',
      },
      onScroll: handleScroll,
    },
    innerProps: {
      style: {
        height: itemPositions.totalHeight,
        position: 'relative',
      },
    },
    totalHeight: itemPositions.totalHeight,
    visibleRange,
  };
}
