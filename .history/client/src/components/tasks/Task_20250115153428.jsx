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

export default function Task({ task }) {
  const [isHover, setIsHover] = useState(false);
  const [taskMore, setTaskMore] = useState(false);

  return (
    <div
      className={styles["task"]}
      onMouseEnter={(e) => setIsHover(true)}
      onMouseLeave={(e) => setIsHover(false)}
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
        <TaskResponsibles task={task} />
        {/* Status */}
        <TaskStatus task={task} />
        {/* Priority */}
        <TaskPriority task={task} />
        {/* Deadline */}
        <TaskDeadline task={task} />
      </div>
      {/* Task remove icon */}
      {isHover && <TaskRemove />}
      {taskMore && <TaskMore task={task} setTaskMore={setTaskMore} />}
    </div>
  );
}
