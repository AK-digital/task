"use client";
import styles from "@/styles/components/task/task-status.module.css";
import { updateTaskStatus } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { Plus } from "lucide-react";
import { getFloating, usePreventScroll } from "@/utils/floating";
import { allowedStatus } from "@/utils/utils";

export default function TaskStatus({ task, uid }) {
  const [status, setStatus] = useState(task?.status);
  const [isOpen, setIsOpen] = useState(false);
  const project = task?.projectId;

  const { refs, floatingStyles } = getFloating(isOpen, setIsOpen);

  usePreventScroll({
    elementRef: refs.floating,
    shouldPrevent: true,
    mode: "element",
  });

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
    <div className={styles.container}>
      <div
        className={styles.current}
        data-current={status}
        onClick={handleIsOpen}
        ref={refs.setReference}
      >
        <span>{status}</span>
      </div>
      {isOpen && (
        <>
          <div
            className={styles.list}
            ref={refs.setFloating}
            style={floatingStyles}
          >
            <ul>
              {allowedStatus?.map((value, idx) => {
                return (
                  <li
                    key={idx}
                    className={styles.item}
                    data-value={value}
                    onClick={handleUpdateStatus}
                  >
                    {value}
                  </li>
                );
              })}
              <li className={styles.add}>
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
