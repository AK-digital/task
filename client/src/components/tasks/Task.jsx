"use client";
import styles from "@/styles/components/tasks/task.module.css";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskText from "./TaskText";
import TaskRemove from "./TaskRemove";
import TaskResponsibles from "./TaskResponsibles";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskTimer from "./TaskTimer";
import React, { useCallback, useContext } from "react";
import TaskMore from "./TaskMore";
import TaskEstimate from "./TaskEstimate";
import { AuthContext } from "@/context/auth";
import { useUserRole } from "@/app/hooks/useUserRole";
import { GripVertical, MessageCircle } from "lucide-react";
import { useTaskContext } from "@/context/TaskContext";

export default function Task({
  task,
  project,
  isDragging,
  setSelectedTasks,
  archive,
}) {
  const { uid } = useContext(AuthContext);
  const { openedTask, openTask } = useTaskContext();

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);
  const canDrag = useUserRole(project, ["owner", "manager", "team"]);

  const hasUnreadMessages = task?.messages?.some(
    (message) => !message.readBy.includes(uid)
  );

  function hasDescription() {
    if (task?.description && task?.description?.text) {
      if (task?.description?.text !== "") {
        return true;
      }
    } else {
      return false;
    }
  }

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task?._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTaskClick = useCallback(
    (e) => {
      e.preventDefault();
      openTask(task?._id, archive, project?._id);
    },
    [archive, project?._id, task?._id]
  );

  function handleSelectedTask(e) {
    setSelectedTasks((prev) => {
      if (e.target.checked) {
        return [...prev, task?._id];
      } else {
        return prev.filter((id) => id !== task?._id);
      }
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.container} ${isDragging ? styles.dragging : ""}`}
      suppressHydrationWarning
      data-openned={openedTask === task?._id}
      data-done={task?.status === "Terminée"}
    >
      {canEdit && (
        <div className={`${styles.checkbox} ${styles.row}`}>
          <input
            type="checkbox"
            name="task"
            id={`task-${task?._id}`}
            data-value={task?._id}
            defaultValue={task?._id}
            onClick={handleSelectedTask}
          />
        </div>
      )}
      {canDrag && (
        <div
          {...attributes}
          {...listeners}
          suppressHydrationWarning
          className={`${styles.grip} ${styles.row}`}
        >
          <GripVertical size={20} />
        </div>
      )}
      <TaskText task={task} project={project} uid={uid} archive={archive} />
      <div
        className={`${styles.comment} ${styles.row}`}
        onClick={handleTaskClick}
        data-has-description={hasDescription()}
      >
        <MessageCircle size={24} fillOpacity={0} />
        {task?.messages?.length > 0 && (
          <span
            className={`${styles.count} ${styles.messageIcon}`}
            data-is-unread={hasUnreadMessages}
          >
            {task?.messages?.length}
          </span>
        )}
      </div>
      <TaskResponsibles task={task} project={project} archive={archive} />
      <TaskStatus task={task} project={project} uid={uid} />
      <TaskPriority task={task} project={project} uid={uid} />
      <TaskDeadline task={task} project={project} uid={uid} />
      <TaskEstimate task={task} project={project} uid={uid} />
      {!archive && <TaskTimer task={task} project={project} uid={uid} />}
      <TaskRemove task={task} project={project} uid={uid} archive={archive} />
      {openedTask === task?._id && (
        <TaskMore task={task} project={project} archive={archive} uid={uid} />
      )}
    </div>
  );
}
