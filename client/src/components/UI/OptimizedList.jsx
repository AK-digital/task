"use client";
import { memo, useMemo } from "react";
import { useVirtualizedList } from "@/hooks/useVirtualizedList";

/**
 * Composant de liste optimisé avec virtualisation automatique
 * Se base sur la taille des données pour décider d'utiliser la virtualisation
 */
const OptimizedList = memo(function OptimizedList({
  items = [],
  renderItem,
  itemHeight = 60,
  containerHeight = 400,
  virtualizationThreshold = 50,
  keyExtractor = (item, index) => item?.id || item?._id || index,
  className = "",
  ...props
}) {
  // Décider si on doit virtualiser basé sur le nombre d'éléments
  const shouldVirtualize = items.length > virtualizationThreshold;

  const {
    visibleItems,
    containerProps,
    innerProps,
  } = useVirtualizedList({
    items,
    itemHeight,
    containerHeight,
    overscan: Math.min(5, Math.ceil(virtualizationThreshold / 10)),
  });

  // Mémoriser les éléments à rendre pour éviter les recalculs
  const renderedItems = useMemo(() => {
    const itemsToRender = shouldVirtualize ? visibleItems : items;
    
    return itemsToRender.map((item, index) => {
      const key = keyExtractor(item, index);
      return (
        <div key={key} data-index={index}>
          {renderItem(item, index)}
        </div>
      );
    });
  }, [shouldVirtualize, visibleItems, items, renderItem, keyExtractor]);

  if (shouldVirtualize) {
    return (
      <div className={`optimized-list-container ${className}`} {...props}>
        <div {...containerProps}>
          <div {...innerProps}>
            {renderedItems}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`optimized-list ${className}`} {...props}>
      {renderedItems}
    </div>
  );
});

export default OptimizedList;
