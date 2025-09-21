import TaskBoard from "@/components/Task/TaskBoard";
import TaskProject from "@/components/Task/TaskProject";
import TaskText from "@/components/Task/TaskText";
import { useContext, useState, memo, useMemo, useCallback } from "react";
import TaskResponsibles from "./TaskResponsibles";
import TaskStatus from "./TaskStatus";
import { AuthContext } from "@/context/auth";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskEstimate from "./TaskEstimate";
import TaskTimer from "./TaskTimer";
import TaskConversation from "./TaskConversation";
import TaskCheckbox from "./TaskCheckbox";
import TaskDrag from "./TaskDrag";
import { useUserRole } from "@/hooks/api/useUserRole";
import { useTaskContext } from "@/context/TaskContext";
import TaskMore from "./TaskMore";
import TaskContextMenu from "./TaskContextMenu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

const Task = memo(function Task({
  task,
  displayedElts,
  setSelectedTasks,
  selectedTasks,
  isDragging,
  mutate,
  // Props pour les sous-tâches (optionnelles)
  subtaskCount = 0,
  isExpanded = false,
  setIsExpanded,
  showAddForm = false,
  setShowAddForm,
  handleToggleExpand,
}) {
  const { uid, user } = useContext(AuthContext);
  const { openedTask } = useTaskContext();
  
  // Mémoriser la déstructuration des displayedElts
  const {
    isCheckbox,
    isDrag,
    isProject,
    isBoard,
    isAdmin,
    isStatus,
    isPriority,
    isDeadline,
    isEstimate,
    isTimer,
  } = useMemo(() => displayedElts, [displayedElts]);
  
  const project = task?.projectId;

  // Appeler les hooks au niveau supérieur
  const canDrag = useUserRole(project, ["owner", "manager", "team"]);
  const canContextMenu = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  let { attributes, listeners, setNodeRef, transform, transition, isDragging: sortableIsDragging } =
    useSortable({ id: task?._id });

  if (!canDrag) {
    attributes = "";
    listeners = "";
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Utiliser isDragging du prop ou du sortable
  const isCurrentlyDragging = isDragging || sortableIsDragging;

  const handleContextMenu = useCallback((e) => {
    if (!canContextMenu) return;
    
    // Ne pas ouvrir le menu contextuel si le clic provient du container_TaskMore
    if (e.target.closest('.container_TaskMore')) {
      return;
    }
    
    // Ne pas ouvrir le menu contextuel si le clic provient du task-modal-layout
    if (e.target.closest('.task-modal-layout')) {
      return;
    }
    
    // Ne pas ouvrir le menu contextuel si le clic provient d'un FloatingMenu
    if (e.target.closest('[data-floating-menu]')) {
      return;
    }
    
    // Ne pas ouvrir le menu contextuel si le clic provient d'un DatePicker
    if (e.target.closest('[data-datepicker]') || e.target.closest('.datepicker-container')) {
      return;
    }
    
    // Ne pas ouvrir le menu contextuel si le clic provient du menu des responsables
    if (e.target.closest('[data-task-responsibles-menu]')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setContextMenuOpen(true);
  }, [canContextMenu]);


  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`container_Task sortable-item flex items-center border-t border-text-color h-[40px] cursor-pointer text-text-dark-color transition-all duration-[120ms] ease-in-out bg-secondary data-[openned=true]:bg-[#ebded1] data-[openned=true]:shadow-xl ${
          isCurrentlyDragging ? "is-dragging" : ""
        }`}
        suppressHydrationWarning
        data-openned={openedTask === task?._id}
        data-done={task?.status === "Terminée"}
        data-task-id={task?._id}
        onContextMenu={handleContextMenu}
      >
      {/* Checkbox */}
      {isCheckbox && (
        <TaskCheckbox task={task} setSelectedTasks={setSelectedTasks} selectedTasks={selectedTasks} />
      )}
      {/* Drag */}
      {isDrag && (
        <div
            className="data-[drag=false]:cursor-[inherit]! data-[drag=false]:invisible flex-shrink-0  mr-2"
          data-drag={canDrag}
        >
          <TaskDrag attributes={attributes} listeners={listeners} />
        </div>
      )}

        {/* Boutons de sous-tâches (seulement si les fonctions sont disponibles) */}
        {handleToggleExpand && (
          <div className="task-content-col flex justify-center items-center pl-2">
            {/* Bouton toggle pour les sous-tâches (à gauche) */}
            {subtaskCount > 0 ? (
                <span
                onClick={handleToggleExpand}
                className="subtask-toggle-button z-10 text-gray-500 hover:text-accent-color"
              >
                {isExpanded ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </span>
            ) : (
              <span
                onClick={handleToggleExpand}
                className={`subtask-toggle-button transition-colors text-gray-500 hover:text-accent-color z-10 ${
                  isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title={subtaskCount === 0 ? "Ajouter une sous-tâche" : (isExpanded ? "Réduire les sous-tâches" : "Développer les sous-tâches")}
              >
                {isExpanded ? (
                    <ChevronDown size={20} />
                ) : (
                      <ChevronRight size={20} />
                )}
              </span>
            )}
          </div>
        )}
      {/* Name */}
      <TaskText task={task} />
      {/* Conversation */}
      <TaskConversation task={task} uid={uid} />

      {/* Project */}
      {isProject && <TaskProject task={task} />}
      {/* Board */}
      {isBoard && <TaskBoard task={task} />}
      {/* Responsibles */}
      {isAdmin && <TaskResponsibles task={task} uid={uid} user={user} />}
      {/* Status */}
      {isStatus && <TaskStatus task={task} />}
      {/* Priority */}
      {isPriority && <TaskPriority task={task} />}
      {/* Deadline */}
      {isDeadline && <TaskDeadline task={task} uid={uid} />}
      {/* Estimation */}
      {isEstimate && <TaskEstimate task={task} uid={uid} />}
      {/* Timer */}
      {isTimer && <TaskTimer task={task} />}

        {(openedTask === task?._id || (typeof openedTask === 'object' && openedTask?.isSubtask && openedTask?.parentTask?._id === task?._id)) && (
          <TaskMore 
            task={typeof openedTask === 'object' && openedTask?.isSubtask ? openedTask : task} 
            archive={false} 
            uid={uid} 
            mutateTasks={mutate} 
          />
        )}
      </div>

      {/* Context Menu */}
      {canContextMenu && (
        <TaskContextMenu
          isOpen={contextMenuOpen}
          setIsOpen={setContextMenuOpen}
          position={contextMenuPosition}
          task={task}
          mutate={mutate}
        />
      )}
    </>
  );
});

export default Task;
