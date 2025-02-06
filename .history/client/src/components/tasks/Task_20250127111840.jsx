import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/components/tasks/task.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faListUl, faMessage } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function Task({ task, project, id }) {
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
      className={styles["task"]}
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={styles["task__content"]}>
        <FontAwesomeIcon icon={faListUl} />
        {/* Task Text */}
        <p>{task.name}</p>
        {/* Open task */}
        <div
          className={styles["task__modal"]}
          onClick={() => setTaskMore(true)}
        >
          <FontAwesomeIcon icon={faMessage} />
        </div>
      </div>
      {/* Task More Modal */}
      {taskMore && <div>More Options</div>}
    </div>
  );
}
