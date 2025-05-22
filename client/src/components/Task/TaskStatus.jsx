"use client";
import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskStatus } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { allowedStatus } from "@/utils/utils";
import Portal from "../Portal/Portal";

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
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown__current"]}
        data-current={status}
        onClick={handleIsOpen}
      >
        <span>{status}</span>
      </div>
      {isOpen && (
        <>
          <div className={styles["dropdown__list"]}>
            <ul>
              {allowedStatus?.map((value, idx) => {
                return (
                  <li key={idx} data-value={value} onClick={handleUpdateStatus}>
                    {value}
                  </li>
                );
              })}
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
