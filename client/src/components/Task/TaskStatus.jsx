"use client";
import { updateTaskStatus } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { allowedStatus } from "@/utils/utils";
import { Plus } from "lucide-react";

export default function TaskStatus({ task, uid }) {
  const [status, setStatus] = useState(task?.status);
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
    setStatus(value);
    setIsOpen(false);

    const res = await updateTaskStatus(task?._id, project?._id, value);

    if (!res?.success) {
      setStatus(task?.status);
      return;
    }

    socket.emit("update task", project?._id);
  }

  const handleIsOpen = useCallback(() => {
    if (!canEdit) return;

    setIsOpen((prev) => !prev);
  }, [project, uid]);

  useMemo(() => {
    setStatus(task?.status);
  }, [task?.status]);

  return (
    <div className="relative flex items-center select-none border-r border-text-light-color text-text-size-normal text-color-foreground min-w-[135px] max-w-[150px] w-full h-full">
      <div
        className="relative flex items-center justify-center w-full min-w-[110px] text-center cursor-pointer py-2 px-4 rounded-border-radius-large mx-3 text-white data-[current='En attente']:bg-state-pending-color data-[current='À faire']:bg-state-todo-color data-[current='En cours']:bg-state-processing-color data-[current='Bloquée']:bg-state-blocked-color data-[current='Terminée']:bg-state-finished-color data-[current='À vérifier']:bg-state-checking-color data-[current='À estimer']:bg-state-estimating-color"
        data-current={status}
        onClick={handleIsOpen}
      >
        <span>{status}</span>
      </div>
      {isOpen && (
        <>
          <div className="absolute z-[2001] top-[45px] left-0 w-full p-2 bg-background-secondary-color shadow-[2px_2px_4px_rgba(0,0,0,0.25),-2px_2px_4px_rgba(0,0,0,0.25)] rounded-border-radius-small">
            <ul className="gap-inherit text-center flex flex-col gap-2">
              {allowedStatus?.map((value, idx) => {
                return (
                  <li
                    key={idx}
                    className="py-2 px-4 cursor-pointer text-white rounded-border-radius-large data-[value='En attente']:bg-state-pending-color data-[value='À faire']:bg-state-todo-color data-[value='En cours']:bg-state-processing-color data-[value='Bloquée']:bg-state-blocked-color data-[value='Terminée']:bg-state-finished-color data-[value='À vérifier']:bg-state-checking-color data-[value='À estimer']:bg-state-estimating-color"
                    data-value={value}
                    onClick={handleUpdateStatus}
                  >
                    {value}
                  </li>
                );
              })}
              <li className="flex items-center justify-center gap-1 text-text-dark-color border border-dashed border-text-dark-color py-2 px-4 cursor-pointer rounded-border-radius-large">
                <Plus size={16} /> Ajouter
              </li>
            </ul>
          </div>
          <div
            id="modal-layout-opacity"
            onClick={(e) => setIsOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
}
