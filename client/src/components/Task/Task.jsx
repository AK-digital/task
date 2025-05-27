import TaskBoard from "@/components/Task/TaskBoard";
import TaskProject from "@/components/Task/TaskProject";
import TaskText from "@/components/Task/TaskText";
import styles from "@/styles/components/task/task.module.css";
import { useContext } from "react";
import TaskResponsibles from "./TaskResponsibles";
import TaskStatus from "./TaskStatus";
import { AuthContext } from "@/context/auth";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskEstimate from "./TaskEstimate";
import TaskTimer from "./TaskTimer";
import TaskRemove from "./TaskRemove";
import TaskConversation from "./TaskConversation";
import TaskCheckbox from "./TaskCheckbox";
import TaskDrag from "./TaskDrag";
import { useUserRole } from "@/app/hooks/useUserRole";
import { useTaskContext } from "@/context/TaskContext";
import TaskMore from "./TaskMore";
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
  const canRemove = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`container_Task flex items-center border-t border-text-color h-[46px] cursor-pointer text-text-color-dark transition-all duration-[120ms] ease-in-out bg-background-secondary-color data-[openned=true]:bg-[#ebded1] hover:shadow-[0_4px_2px_-2px_rgba(0,0,0,0.1)] ${isDragging ? "opacity-0" : ""}`}
      suppressHydrationWarning
      data-openned={openedTask === task?._id}
      data-done={task?.status === "Terminée"}
    >
      {/* Checkbox */}
      {isCheckbox && (
        <TaskCheckbox task={task} setSelectedTasks={setSelectedTasks} />
      )}
      {/* Drag */}
      {isDrag && (
        <div className="data-[drag=false]:cursor-[inherit]! data-[drag=false]:invisible" data-drag={canDrag}>
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
      {/* Remove */}
      {canRemove ? (
        <TaskRemove task={task} archive={false} mutate={mutate} />
      ) : (
        <div className="relative px-1.5 min-w-8"></div>
      )}

      {openedTask === task?._id && (
        <TaskMore task={task} archive={false} uid={uid} mutateTasks={mutate} />
      )}
    </div>
  );
}
