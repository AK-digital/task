import styles from "@/styles/components/task/task-text.module.css";
import { updateTaskText } from "@/api/task";
import { useUserRole } from "@/app/hooks/useUserRole";
import socket from "@/utils/socket";
import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { bricolageGrostesque } from "@/utils/font";

export default function TaskText({ task }) {
  const [isEdit, setIsEdit] = useState(false);
  const [value, setValue] = useState(task?.text || "");
  const project = task?.projectId;

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleUpdateTaskText() {
    const response = await updateTaskText(task?._id, project?._id, value);

    if (!response.success) return;

    socket.emit("update task", project?._id);
  }

  // Debounce the function to avoid too many requests
  const debounced = useDebouncedCallback(() => {
    handleUpdateTaskText();
  }, 1000);

  function handleChange(e) {
    setValue(e.target.value);
    debounced();
  }

  function handleEdit() {
    // Guests are not allowed to edit tasks
    if (!canEdit) return;

    setIsEdit(true);
  }

  useEffect(() => {
    setValue(task?.text);
  }, [task?.text]);

  return (
    <div className={styles.container} onClick={handleEdit} id="task-row">
      {!isEdit && <span>{value}</span>}
      {isEdit && (
        <input
          type="text"
          name="text"
          id="text"
          value={value}
          onChange={handleChange}
          onBlur={() => setIsEdit(false)}
          autoFocus
          className={bricolageGrostesque.className}
        />
      )}
    </div>
  );
}
