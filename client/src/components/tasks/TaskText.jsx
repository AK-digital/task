import styles from "@/styles/components/tasks/task-text.module.css";
import { updateTaskText } from "@/actions/task";
import { useActionState, useEffect, useRef, useState } from "react";
import { bricolageGrostesque } from "@/utils/font";
import socket from "@/utils/socket";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function TaskText({ isHeader, task, project }) {
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

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    formRef?.current?.requestSubmit();
  };

  useEffect(() => {
    if (state?.status === "success") {
      const guests = [...project?.guests, project?.author];

      socket.emit("task text update", guests, task?._id, inputValue);
    }
  }, [state]);

  useEffect(() => {
    async function handleTextUpdate(taskId, value) {
      if (task?._id !== taskId) return;
      setInputValue(value);
    }

    socket.on("task text updated", handleTextUpdate);

    return () => {
      socket.off("task text updated", handleTextUpdate);
    };
  }, [inputValue]);

  return (
    <div className={styles.container}>
      {!edit && <p onClick={(e) => setEdit(true)}>{inputValue}</p>}
      {edit && (
        <form action={formAction} ref={formRef}>
          <input
            type="text"
            name="text"
            id="text"
            value={inputValue}
            onChange={handleChange}
            className={bricolageGrostesque.className}
            onBlur={(e) => setEdit(false)}
            autoFocus
          />
        </form>
      )}
    </div>
  );
}
