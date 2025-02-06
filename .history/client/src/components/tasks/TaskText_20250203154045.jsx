import styles from "@/styles/components/tasks/task-text.module.css";
import { updateTaskText } from "@/actions/task";
import { useActionState, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { instrumentSans } from "@/utils/font";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function TaskText({ task }) {
  const formRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const [inputValue, setInputValue] = useState(task?.text || "");
  const updateTaskTextWithIds = updateTaskText.bind(
    null,
    task?._id,
    task?.projectId
  );
  const [state, formAction, pending] = useActionState(
    updateTaskTextWithIds,
    initialState
  );

  // Créer un callback avec un délai de 300ms
  const debouncedUpdateTask = useDebouncedCallback(async (value) => {});

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    formRef?.current?.requestSubmit();
    debouncedUpdateTask(value);
  };

  return (
    <div
      className={styles.container}
      onMouseEnter={(e) => setEdit(true)}
      onMouseLeave={(e) => setEdit(false)}
    >
      {!edit && <p>{task?.text}</p>}
      {edit && (
        <form action={formAction} ref={formRef}>
          <input
            type="text"
            name="text"
            id="text"
            value={inputValue}
            onChange={handleChange}
            className={instrumentSans.className}
          />
        </form>
      )}
    </div>
  );
}
