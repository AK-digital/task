import { updateTaskText } from "@/api/task";
import { useUserRole } from "../../../hooks/useUserRole";
import socket from "@/utils/socket";
import React, { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

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
    <div
      className="flex items-center h-full w-full min-w-[150px] sm:min-w-[200px] lg:min-w-[240px] max-w-[700px] cursor-text mx-2 flex-grow"
      onClick={handleEdit}
    >
      {!isEdit && (
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis text-normal tracking-[0.01em]">
          {value}
        </span>
      )}
      {isEdit && (
        <input
          type="text"
          name="text"
          id="text"
          value={value}
          onChange={handleChange}
          onBlur={() => setIsEdit(false)}
          autoFocus
          className="relative text-normal tracking-[0.01em] border-none focus:text-text-darker-color focus:rounded-sm font-bricolage w-full"
        />
      )}
    </div>
  );
}
