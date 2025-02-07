import styles from "@/styles/components/tasks/task.module.css";
import { useState } from "react";
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
import Link from "next/link";

export default function Task({ task, project }) {
  const [isHover, setIsHover] = useState(false);

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
            <FontAwesomeIcon icon={faGripVertical} />
          </div>
          <TaskText task={task} />
          <div className={styles.comment}>
            <Link
              href={`/project/${project?._id}/task/${task?._id}`}
              scroll={false}
            >
              <FontAwesomeIcon icon={faComment} />
            </Link>
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
    </div>
  );
}
