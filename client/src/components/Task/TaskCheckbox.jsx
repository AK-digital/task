import { useUserRole } from "@/hooks/api/useUserRole";
import { useMemo, memo, useCallback } from "react";
import { Check } from "lucide-react";

const TaskCheckbox = memo(function TaskCheckbox({ task, setSelectedTasks, selectedTasks = [] }) {
  const project = task?.projectId;

  // Appeler le hook au niveau supérieur
  const canEdit = useUserRole(project, [
    "owner",
    "manager", 
    "team",
    "customer",
  ]);

  // Optimisation : utiliser un Set pour une recherche O(1)
  const selectedTasksSet = useMemo(() => {
    return new Set(selectedTasks.map(item => item._id));
  }, [selectedTasks]);

  const isChecked = useMemo(() => {
    return selectedTasksSet.has(task?._id);
  }, [selectedTasksSet, task?._id]);

  const handleSelectTask = useCallback((e) => {
    e.stopPropagation();
    
    const taskId = task?._id;
    
    // Utiliser l'état logique React au lieu de e.target.checked
    if (!isChecked) {
      // Ajouter la tâche si elle n'est pas sélectionnée
      setSelectedTasks((prev) => [...prev, {
        _id: taskId,
        isSubtask: task?.isSubtask || false
      }]);
    } else {
      // Retirer la tâche si elle est déjà sélectionnée
      setSelectedTasks((prev) => prev.filter((item) => item._id !== taskId));
    }
  }, [task?._id, task?.isSubtask, isChecked, setSelectedTasks]);

  return (
    <div className="task-col-checkbox task-content-col select-none relative">
      <div className="relative">
        <input
          type="checkbox"
          name="task"
          id={`task-${task?._id}`}
          value={task?._id}
          checked={isChecked}
          onChange={handleSelectTask}
          disabled={!canEdit}
          className="sr-only"
        />
        <label 
          htmlFor={`task-${task?._id}`}
          className={`
            flex items-center justify-center w-4 h-4 border-1 rounded cursor-pointer 
            ${isChecked 
              ? 'bg-accent-color border-accent-color text-white' 
              : 'bg-transparent border-text-medium-color hover:border-accent-color'
            }
            ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent-color-transparent'}
          `}
        >
          {isChecked && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </label>
      </div>
    </div>
  );
});

export default TaskCheckbox;
  