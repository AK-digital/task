"use client";
import { memo, useMemo, useCallback } from "react";
import { useVirtualizedList } from "@/hooks/useVirtualizedList";
import { useOptimizedDragDrop } from "@/hooks/useOptimizedDragDrop";

/**
 * Composant de liste de tâches optimisé avec drag and drop et virtualisation
 */
const OptimizedTaskList = memo(function OptimizedTaskList({
  tasks = [],
  renderTask,
  onDragStart,
  onDragOver,
  onDragEnd,
  virtualizationThreshold = 50,
  itemHeight = 60,
  containerHeight = 600,
  keyExtractor = (task) => task?._id,
  className = "",
  ...props
}) {
  // Décider si on doit virtualiser
  const shouldVirtualize = tasks.length > virtualizationThreshold;

  // Hook de drag and drop optimisé
  const { sensors: dragSensors } = useOptimizedDragDrop({
    onDragStart,
    onDragOver,
    onDragEnd,
    throttleDelay: 16, // 60fps
    batchDelay: 50,
  });

  // Hook de virtualisation
  const {
    visibleItems: visibleTasks,
    containerProps,
    innerProps,
  } = useVirtualizedList({
    items: tasks,
    itemHeight,
    containerHeight,
    overscan: Math.min(10, Math.ceil(virtualizationThreshold / 5)),
  });

  // Mémoriser les tâches à rendre
  const renderedTasks = useMemo(() => {
    const tasksToRender = shouldVirtualize ? visibleTasks : tasks;
    
    return tasksToRender.map((task, index) => {
      const key = keyExtractor(task, index);
      return (
        <div key={key} data-task-id={task._id} data-index={index}>
          {renderTask(task, index, {
            isDragging: false, // sera mis à jour par le contexte de drag
            isVirtualized: shouldVirtualize,
          })}
        </div>
      );
    });
  }, [shouldVirtualize, visibleTasks, tasks, renderTask, keyExtractor]);

  // Optimiser les props du conteneur
  const containerClassName = useMemo(() => {
    return `optimized-task-list ${shouldVirtualize ? 'virtualized' : 'standard'} ${className}`;
  }, [shouldVirtualize, className]);

  if (shouldVirtualize) {
    return (
      <div className={containerClassName} {...props}>
        <div {...containerProps}>
          <div {...innerProps}>
            {renderedTasks}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClassName} {...props}>
      {renderedTasks}
    </div>
  );
});

/**
 * Hook pour optimiser le rendu des éléments de tâche individuels
 */
export function useOptimizedTaskItem(task, options = {}) {
  const {
    enableMemoization = true,
    trackChanges = ['status', 'priority', 'title', 'deadline'],
  } = options;

  // Mémoriser les propriétés importantes de la tâche
  const taskProps = useMemo(() => {
    if (!enableMemoization) return task;

    // Ne mémoriser que les propriétés qui nous intéressent
    const relevantProps = {};
    trackChanges.forEach(prop => {
      relevantProps[prop] = task?.[prop];
    });

    return {
      _id: task?._id,
      ...relevantProps,
    };
  }, [task, enableMemoization, trackChanges]);

  // Optimiser les callbacks de la tâche
  const optimizedCallbacks = useMemo(() => ({
    onSelect: (taskId) => {
      // Callback optimisé pour la sélection
    },
    onUpdate: (taskId, updates) => {
      // Callback optimisé pour la mise à jour
    },
    onDelete: (taskId) => {
      // Callback optimisé pour la suppression
    },
  }), [task?._id]);

  return {
    taskProps,
    optimizedCallbacks,
  };
}

/**
 * Composant de tâche optimisé pour les listes
 */
export const OptimizedTaskItem = memo(function OptimizedTaskItem({
  task,
  index,
  isDragging,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  children,
  ...props
}) {
  const { taskProps, optimizedCallbacks } = useOptimizedTaskItem(task);

  const handleSelect = useCallback((e) => {
    e.stopPropagation();
    onSelect?.(task._id, !isSelected);
  }, [task._id, isSelected, onSelect]);

  const itemClassName = useMemo(() => {
    return `task-item ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`;
  }, [isDragging, isSelected]);

  return (
    <div
      className={itemClassName}
      data-task-id={task._id}
      data-index={index}
      onClick={handleSelect}
      {...props}
    >
      {children || (
        <div className="task-content">
          <span className="task-title">{task.title}</span>
          <span className="task-status">{task.status?.name}</span>
        </div>
      )}
    </div>
  );
});

export default OptimizedTaskList;
