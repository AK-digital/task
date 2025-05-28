import { updateTaskPriority } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";

const priorities = ["Basse", "Moyenne", "Haute", "Urgent"];

export default function TaskPriority({ task }) {
  const [priority, setPriority] = useState(task?.priority);
  const [isOpen, setIsOpen] = useState(false);
  const project = task?.projectId;
  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleUpdateStatus(e) {
    const value = e.target.dataset.value;
    setPriority(value);
    setIsOpen(false);

    const response = await updateTaskPriority(
      task?._id,
      task?.projectId?._id,
      value
    );

    if (response?.status === "failure") {
      setPriority(task?.priority);
      return;
    }

    socket.emit("update task", project?._id);
  }

  const handleIsOpen = useCallback(() => {
    if (!canEdit) return;

    setIsOpen((prev) => !prev);
  });

  useMemo(() => {
    setPriority(task?.priority);
  }, [task?.priority]);

  return (
    <div className="relative flex items-center select-none border-r border-text-light-color text-text-size-normal text-text-color min-w-[135px] max-w-[150px] w-full h-full">
      <div
        className="dropdown__current_TaskPriority relative flex items-center justify-center w-full min-w-[110px] text-center cursor-pointer py-2 px-4 rounded-border-radius-large mx-3 text-white"
        data-current={priority}
        onClick={handleIsOpen}
      >
        <span>{priority}</span>
      </div>
      {isOpen && (
        <>
          <div className="dropdown__list_TaskPriority absolute z-[2001] top-[45px] left-0 w-full p-2 bg-background-secondary-color shadow-[2px_2px_4px_rgba(0,0,0,0.25),-2px_2px_4px_rgba(0,0,0,0.25)] rounded-border-radius-small">
            <ul className="text-center flex flex-col gap-2">
              {priorities?.map((value, idx) => {
                return (
                  <li key={idx} data-value={value} onClick={handleUpdateStatus} className="py-2 px-4 cursor-pointer text-white rounded-border-radius-large">
                    {value}
                  </li>
                );
              })}
            </ul>
          </div>
          <div
            className="modal-layout-opacity"
            onClick={(e) => setIsOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
}
