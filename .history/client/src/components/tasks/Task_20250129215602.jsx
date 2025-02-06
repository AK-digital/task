import styles from "@/styles/components/tasks/task.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripLines, faListUl } from "@fortawesome/free-solid-svg-icons";
import { faComment } from "@fortawesome/free-regular-svg-icons";
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
      ref={setNodeRef}
      style={style}
      className={styles.container}
      onMouseEnter={(e) => setIsHover(true)}
      onMouseLeave={(e) => setIsHover(false)}
      suppressHydrationWarning
    >
      <div className={styles.content}>
        <div className={styles.wrapper}>
          <div {...attributes} {...listeners} suppressHydrationWarning>
            <FontAwesomeIcon icon={faGripLines} />
          </div>
          <TaskText task={task} />
          <div className={styles.comment} onClick={(e) => setTaskMore(true)}>
            <FontAwesomeIcon icon={faComment} />
          </div>
          <TaskResponsibles task={task} project={project} />
        </div>
        <div className={styles.options}>
          <TaskStatus task={task} />
          <TaskPriority task={task} />
        </div>
        <TaskDeadline task={task} />
      </div>
      {isHover && <TaskRemove task={task} />}
      {taskMore && <TaskMore task={task} setTaskMore={setTaskMore} />}
    </div>
  );
}
