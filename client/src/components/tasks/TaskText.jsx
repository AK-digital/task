import styles from "@/styles/components/tasks/task.module.css";
import { useEffect, useState } from "react";
import { bricolageGrostesque } from "@/utils/font";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";
import { useDebouncedCallback } from "use-debounce";
import { updateTaskText } from "@/api/task";
import { mutate } from "swr";

export default function TaskText({ task, project, uid, archive }) {
  const [edit, setEdit] = useState(false);
  const [inputValue, setInputValue] = useState(task?.text || "");

  async function handleUpdateTaskText(value) {
    const response = await updateTaskText(task?._id, project?._id, value);

    if (!response.success) return;

    mutate(`/task?projectId=${project?._id}&archived=${archive}`);

    socket.emit("update task", project?._id);
  }

  const debouncedSend = useDebouncedCallback((value) => {
    handleUpdateTaskText(value);
  }, 1000);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSend(value);
  };

  useEffect(() => {
    setInputValue(task?.text);
  }, [task?.text]);

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
    <div className={`${styles.text}`}>
      {!edit && <span onClick={handleEdit}>{inputValue}</span>}
      {edit && (
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
      )}
    </div>
  );
}
