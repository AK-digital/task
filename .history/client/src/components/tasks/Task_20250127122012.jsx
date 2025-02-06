import styles from "@/styles/components/tasks/task.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl, faMessage } from "@fortawesome/free-solid-svg-icons";
import TaskMore from "./TaskMore";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskText from "./TaskText";
import TaskRemove from "./TaskRemove";
import TaskResponsibles from "./TaskResponsibles";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Task({ task, project }) {
  const [isHover, setIsHover] = useState(false);
  const [taskMore, setTaskMore] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      style={style}
      className={styles["task"]}
      onMouseEnter={(e) => setIsHover(true)}
      onMouseLeave={(e) => setIsHover(false)}
      suppressHydrationWarning
    >
      <div className={styles["task__content"]}>
        <div
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          suppressHydrationWarning
        >
          <FontAwesomeIcon icon={faListUl} />
        </div>
        <TaskText task={task} />
        <div
          className={styles["task__modal"]}
          onClick={(e) => setTaskMore(true)}
        >
          <FontAwesomeIcon icon={faMessage} />
        </div>
        <TaskResponsibles task={task} project={project} />
        <TaskStatus task={task} />
        <TaskPriority task={task} />
        <TaskDeadline task={task} />
      </div>
      {isHover && <TaskRemove task={task} />}
      {taskMore && <TaskMore task={task} setTaskMore={setTaskMore} />}
    </div>
  );
}
