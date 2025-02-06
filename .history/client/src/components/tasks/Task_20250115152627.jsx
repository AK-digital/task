import styles from "@/styles/components/tasks/task.module.css";
import { deleteTask } from "@/api/task";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faListUl,
  faMessage,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import TaskMore from "./TaskMore";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskText from "./TaskText";

export default function Task({ task }) {
  const [taskMore, setTaskMore] = useState(false);

  return (
    <div className={styles["task"]}>
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
        <div className={styles["task__responsibles"]}></div>
        {/* Status */}
        <TaskStatus task={task} />
        {/* Priority */}
        <TaskPriority task={task} />
        {/* Deadline */}
        <TaskDeadline task={task} />
      </div>
      <div className={styles["task__remove"]}>
        <FontAwesomeIcon icon={faTrash} onClick={handleDeleteTask} />
      </div>

      {taskMore && <TaskMore task={task} setTaskMore={setTaskMore} />}
    </div>
  );
}
