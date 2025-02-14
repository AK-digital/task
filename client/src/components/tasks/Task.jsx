"use client";
import styles from "@/styles/components/tasks/task.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskText from "./TaskText";
import TaskRemove from "./TaskRemove";
import TaskResponsibles from "./TaskResponsibles";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskTimer from "./TaskTimer";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import TaskMore from "./TaskMore";

export default function Task({ task, project, isDragging }) {
  const pathname = usePathname();
  const [opennedTask, setOpennedTask] = useState(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTaskClick = (e) => {
    e.preventDefault();

    window.history.pushState(
      {},
      "",
      `/project/${project?._id}/task/${task?._id}`
    );
  };

  useEffect(() => {
    if (pathname?.includes("/task/")) {
      const taskId = pathname.split("/").pop();
      setOpennedTask(taskId);
    }
  }, [pathname]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.container} ${isDragging ? styles.dragging : ""}`}
      suppressHydrationWarning
      data-openned={opennedTask === task?._id}
      data-done={task?.status === "Terminée"}
    >
      <div className={styles.content}>
        <div className={styles.wrapper}>
          <div {...attributes} {...listeners} suppressHydrationWarning>
            <FontAwesomeIcon icon={faGripVertical} />
          </div>
          <TaskText task={task} />
          <div className={styles.comment}>
            <div onClick={handleTaskClick}>
              <FontAwesomeIcon icon={faComment} />
            </div>
          </div>
          <TaskResponsibles task={task} project={project} />
          <div className={styles.options}>
            <TaskStatus task={task} />
            <TaskPriority task={task} />
          </div>
          <TaskDeadline task={task} />
          <TaskTimer task={task} />
          <TaskRemove task={task} />
        </div>
      </div>
      {opennedTask === task?._id && (
        <TaskMore
          task={task}
          project={project}
          setOpennedTask={setOpennedTask}
        />
      )}
    </div>
  );
}
