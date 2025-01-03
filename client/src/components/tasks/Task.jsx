import styles from "@/styles/components/tasks/task.module.css";
import TaskDropdown from "./TaskDropdown";
import { deleteTask } from "@/api/task";
import { useActionState, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { updateTask } from "@/actions/task";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function Task({ task }) {
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
  return (
    <li className={styles["task"]}>
      {/* drag icon*/}
      <form action={formAction} ref={formRef} className={styles["task__form"]}>
        {/* input */}
        <div className={styles["task__left"]}>
          <div className={styles["task__input"]}>
            <input
              type="text"
              name="text"
              id="text"
              value={inputValue}
              onChange={handleChange}
            />
          </div>
          {/* Options */}
          <div className={styles["task__options"]}>
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
            />
            <TaskDropdown
              current={task?.priority}
              values={["Basse", "Moyenne", "Haute", "Urgent"]}
              form={formRef}
            />
            <div className={styles["task__deadline"]}>
              <input
                type="date"
                name="deadline"
                id="deadline"
                defaultValue={task?.deadline}
                form={formRef}
              />
            </div>
          </div>
        </div>
        <div className={styles["task__remove"]}>
          <FontAwesomeIcon icon={faTrash} onClick={handleDeleteTask} />
        </div>
      </form>
    </li>
  );
}
