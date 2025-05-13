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

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task?._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.container} ${isDragging ? styles.dragging : ""}`}
      suppressHydrationWarning
      data-openned={openedTask === task?._id}
      data-done={task?.status === "Terminée"}
    >
      {/* Checkbox */}
      {isCheckbox && (
        <TaskCheckbox task={task} setSelectedTasks={setSelectedTasks} />
      )}
      {/* Drag */}
      {isDrag && canDrag && (
        <TaskDrag attributes={attributes} listeners={listeners} />
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
      {canRemove && <TaskRemove task={task} archive={false} mutate={mutate} />}

      {openedTask === task?._id && (
        <TaskMore task={task} archive={false} uid={uid} mutateTasks={mutate} />
      )}
    </div>
  );
}
