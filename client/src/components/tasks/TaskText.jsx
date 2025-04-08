import styles from "@/styles/components/tasks/task-text.module.css";
import { updateTaskText } from "@/actions/task";
import { useActionState, useEffect, useRef, useState } from "react";
import { bricolageGrostesque } from "@/utils/font";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";
import { mutate } from "swr";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function TaskText({ task, project, uid, archive }) {
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
      mutate(`/task?projectId=${project?._id}&archived=${archive}`);

      socket.emit("task text update", project?._id, task?._id, inputValue);
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

  function handleEdit() {
    const isAuthorized = checkRole(
      project,
      ["owner", "manager", "team", "customer"],
      uid
    );

    if (!isAuthorized) return;

    setEdit(true);
  }

  return (
    <div className={styles.container}>
      {!edit && <p onClick={handleEdit}>{inputValue}</p>}
      {edit && (
        <form action={formAction} ref={formRef}>
          <input
            type="text"
            name="text"
            id="text"
            value={inputValue}
            onChange={handleChange}
            className={`${bricolageGrostesque.className} ${styles.input}`}
            onBlur={(e) => setEdit(false)}
            autoFocus
          />
        </form>
      )}
    </div>
  );
}
