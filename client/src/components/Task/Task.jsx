import TaskBoard from "@/components/Task/TaskBoard";
import TaskProject from "@/components/Task/TaskProject";
import TaskText from "@/components/Task/TaskText";
import { useContext, useState } from "react";
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
import { useUserRole } from "../../../hooks/useUserRole";
import { useTaskContext } from "@/context/TaskContext";
import TaskMore from "./TaskMore";
import TaskContextMenu from "./TaskContextMenu";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Task({
  task,
  displayedElts,
  setSelectedTasks,
  isDragging,
  mutate,
}) {
  const { uid, user } = useContext(AuthContext);
  const { openedTask } = useTaskContext();
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
  } = displayedElts;
  const project = task?.projectId;

  const canDrag = useUserRole(project, ["owner", "manager", "team"]);
  const canContextMenu = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  let { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task?._id });

  if (!canDrag) {
    attributes = "";
    listeners = "";
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleContextMenu = (e) => {
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
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`container_Task flex items-center border-t border-text-color h-[40px] cursor-pointer text-text-dark-color transition-all duration-[120ms] ease-in-out bg-secondary data-[openned=true]:bg-[#ebded1] ${
          isDragging ? "opacity-0" : ""
        }`}
        suppressHydrationWarning
        data-openned={openedTask === task?._id}
        data-done={task?.status === "Terminée"}
        data-task-id={task?._id}
        onContextMenu={handleContextMenu}
      >
      {/* Checkbox */}
      {isCheckbox && (
        <TaskCheckbox task={task} setSelectedTasks={setSelectedTasks} />
      )}
      {/* Drag */}
      {isDrag && (
        <div
          className="data-[drag=false]:cursor-[inherit]! data-[drag=false]:invisible flex-shrink-0"
          data-drag={canDrag}
        >
          <TaskDrag attributes={attributes} listeners={listeners} />
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

        {openedTask === task?._id && (
          <TaskMore task={task} archive={false} uid={uid} mutateTasks={mutate} />
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
}
