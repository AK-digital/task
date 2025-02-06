import styles from "@/styles/components/tasks/task.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/components/tasks/task.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl, faMessage } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import TaskRemove from "./TaskRemove";
import TaskMore from "./TaskMore";

export default function Task({ task, project }) {
  const [isHover, setIsHover] = useState(false);
  const [taskMore, setTaskMore] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={styles["task__content"]}>
        <FontAwesomeIcon icon={faListUl} />
        {/* Task text */}
        <TaskText task={task} />
        {/* Open task */}
        <div
          className={styles["task__modal"]}
          onClick={(e) => setTaskMore(true)}
        >
          <FontAwesomeIcon icon={faMessage} />
        </div>
        {/* Responsibles */}
        <TaskResponsibles task={task} project={project} />
        {/* Status */}
        <TaskStatus task={task} />
        {/* Priority */}
        <TaskPriority task={task} />
        {/* Deadline */}
        <TaskDeadline task={task} />
      </div>
      {/* Task remove icon */}
      {isHover && <TaskRemove task={task} />}
      {taskMore && <TaskMore task={task} setTaskMore={setTaskMore} />}
    </div>
  );
}
