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
import { Check, GripVertical } from "lucide-react";

export default function Task({
  task,
  project,
  isDragging,
  selectedTasks,
  setSelectedTasks,
}) {
  const pathname = usePathname();
  const [opennedTask, setOpennedTask] = useState(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task?._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTaskClick = (e) => {
    e.preventDefault();

    window.history.pushState(
      {},
      "",
      `/projects/${project?._id}/task/${task?._id}`
    );
  };

  useEffect(() => {
    if (pathname?.includes("/task/")) {
      const taskId = pathname.split("/").pop();
      setOpennedTask(taskId);
    }
  }, [pathname]);

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
      data-openned={opennedTask === task?._id}
      data-done={task?.status === "Terminée"}
    >
      <div className={styles.content}>
        <div className={styles.wrapper}>
          <div>
            <input
              type="checkbox"
              name="task"
              id="task"
              defaultValue={task?._id}
              onClick={handleSelectedTask}
            />
          </div>
          <div {...attributes} {...listeners} suppressHydrationWarning>
            {/* <GripVertical width={60} height={60} /> */}
            <FontAwesomeIcon icon={faGripVertical} />
          </div>
          <TaskText task={task} project={project} />
          <div className={styles.comment}>
            <div onClick={handleTaskClick}>
              <FontAwesomeIcon icon={faComment} />
            </div>
          </div>

          <TaskResponsibles task={task} project={project} />
          <div className={styles.options}>
            <TaskStatus task={task} project={project} />
            <TaskPriority task={task} project={project} />
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
