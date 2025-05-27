import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { updateTaskPriority } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { getFloating, usePreventScroll } from "@/utils/floating";

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

  const { refs, floatingStyles } = getFloating(isOpen, setIsOpen);

  usePreventScroll({
    elementRef: refs.floating,
    shouldPrevent: true,
    mode: "element",
  });

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
    <div className={styles["dropdown"]}>
      <div
        className={styles["dropdown__current"]}
        data-current={priority}
        onClick={handleIsOpen}
        ref={refs.setReference}
      >
        <span>{priority}</span>
      </div>
      {isOpen && (
        <>
          <div
            className={styles["dropdown__list"]}
            ref={refs.setFloating}
            style={floatingStyles}
          >
            <ul>
              {priorities?.map((value, idx) => {
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
