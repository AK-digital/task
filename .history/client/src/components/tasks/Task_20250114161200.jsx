import styles from "@/styles/components/tasks/task.module.css";
import TaskDropdown from "./TaskDropdown";
import { deleteTask } from "@/api/task";
import { useActionState, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage, faTrash } from "@fortawesome/free-solid-svg-icons";
import { updateTask } from "@/actions/task";
import TaskMore from "./TaskMore";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Task({ task }) {
  const [taskMore, setTaskMore] = useState(false);
  const updateTaskWithIds = updateTask.bind(null, task?._id, task?.projectId);

  const [state, formAction, pending] = useActionState(
    updateTaskWithIds,
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

  function handleUpdateDate(e) {
    formRef.current.requestSubmit();
  }

  const deadline = task?.deadline?.split("T")[0];
  return (
    <div className={styles["task"]}>
      {/* drag icon*/}

      {/* input */}
      <div className={styles["task__left"]}>
        <div className={styles["task__input"]}>
          <form action="">
            <input
              type="text"
              name="text"
              id="text"
              value={inputValue}
              onChange={handleChange}
            />
          </form>
        </div>
        {/* Task options */}
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
          <TaskDropdown
            current={task?.status}
            values={[
              "En attente",
              "À faire",
              "En cours",
              "Bloquée",
              "Terminée",
            ]}
            form={formRef}
            state={state}
          />
          {/* Priority */}
          <TaskDropdown
            current={task?.priority}
            values={["Basse", "Moyenne", "Haute", "Urgent"]}
            form={formRef}
            state={state}
          />
          {/* Deadline */}
          <div className={styles["task__deadline"]}>
            <input
              type="date"
              name="deadline"
              id="deadline"
              defaultValue={deadline}
              onChange={handleUpdateDate}
            />
          </div>
        </div>
      </div>
      <div className={styles["task__remove"]}>
        <FontAwesomeIcon icon={faTrash} onClick={handleDeleteTask} />
      </div>

      {taskMore && <TaskMore task={task} setTaskMore={setTaskMore} />}
    </div>
  );
}
