import styles from "@/styles/components/tasks/task.module.css";
import { deleteTask } from "@/api/task";
import { useActionState, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { updateTaskText } from "@/actions/task";
import TaskMore from "./TaskMore";
import TaskStatus from "./TaskStatus";
import TaskPriority from "./TaskPriority";
import TaskDeadline from "./TaskDeadline";
import TaskText from "./TaskText";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Task({ task }) {
  const [taskMore, setTaskMore] = useState(false);
  const updateTaskTextWithIds = updateTaskText.bind(
    null,
    task?._id,
    task?.projectId
  );

  const [state, formAction, pending] = useActionState(
    updateTaskTextWithIds,
    initialState
  );
  const formRef = useRef(null);
  const [inputValue, setInputValue] = useState(task?.text || "");

  // Créer un callback avec un délai de 300ms
  const debouncedUpdateTask = useDebouncedCallback(async (value) => {
    formRef.current.requestSubmit();
  }, 600);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    debouncedUpdateTask(value);
  };

  async function handleDeleteTask(e) {
    e.preventDefault();
    await deleteTask(task?._id, task?.projectId);
  }

  return (
    <div className={styles["task"]}>
      {/* drag icon*/}

      {/* input */}
      <div className={styles["task__left"]}>
        {/* Task options */}
        <TaskText task={task} />
        <div className={styles["task__options"]}>
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
      </div>
      <div className={styles["task__remove"]}>
        <FontAwesomeIcon icon={faTrash} onClick={handleDeleteTask} />
      </div>

      {taskMore && <TaskMore task={task} setTaskMore={setTaskMore} />}
    </div>
  );
}
