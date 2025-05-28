"use client";
import styles from "@/styles/components/task/task-status.module.css";
import { updateTaskStatus } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { Pen, Plus, Save } from "lucide-react";
import { useProjectContext } from "@/context/ProjectContext";
import TaskEditStatus from "./TaskEditStatus";
import { saveStatus } from "@/api/status";
import { colors } from "@/utils/utils";

export default function TaskStatus({ task, uid }) {
  const { project, mutateTasks, statuses, mutateStatuses } =
    useProjectContext();
  const [currentStatus, setCurrentStatus] = useState(task?.status);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const maxStatuses = statuses?.length === 12;

  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  async function handleTaskUpdateStatus(status) {
    if (!canEdit) return;
    setCurrentStatus(status);
    setIsOpen(false);

    const res = await updateTaskStatus(task?._id, project?._id, status?._id);

    if (!res?.success) {
      setCurrentStatus(task?.status);
      return;
    }

    socket.emit("update task", project?._id);
    mutateTasks();
    mutateStatuses();
  }

  async function handleAddStatus() {
    if (!canEdit) return;

    // Get a random color for the new status and prevent duplicates colors from statuses
    const existingColors = statuses.map((status) => status?.color);
    const availableColors = colors.filter(
      (color) => !existingColors.includes(color)
    );
    const randomColor =
      availableColors[Math.floor(Math.random() * availableColors?.length)];

    const response = await saveStatus(project?._id, {
      name: "Nouveau statut",
      color: randomColor,
    });

    if (!response?.success) {
      console.error("Failed to save status:", response.message);
      return;
    }

    mutateStatuses();
  }

  const handleIsOpen = useCallback(() => {
    if (!canEdit) return;

    setIsOpen((prev) => !prev);
    setIsEdit(false);
  }, [project, uid]);

  function handleEditStatus() {
    if (!canEdit) return;

    setIsEdit((prev) => !prev);
  }

  useMemo(() => {
    setCurrentStatus(task?.status);
  }, [task?.status]);

  const hasStatus = currentStatus?.name;
  const currentBackgroundColor = hasStatus ? currentStatus?.color : "#b3bcc0";

  function listWidth() {
    if (isEdit && statuses?.length > 5) {
      return true;
    } else if (!isEdit && statuses?.length > 6) {
      return true;
    }

    return false;
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.current}
        style={{ backgroundColor: currentBackgroundColor }}
        onClick={handleIsOpen}
      >
        <span>{currentStatus?.name || "En attente"}</span>
      </div>
      {isOpen && (
        <>
          <div className={styles.list} data-big={listWidth()}>
            <ul className={styles.items}>
              {statuses?.map((status) => {
                if (!isEdit) {
                  return (
                    <li
                      key={status?._id}
                      className={styles.item}
                      onClick={() => handleTaskUpdateStatus(status)}
                      style={{ backgroundColor: status?.color }}
                    >
                      {status?.name}
                    </li>
                  );
                } else {
                  return (
                    <TaskEditStatus
                      key={status?._id}
                      status={status}
                      currentStatus={currentStatus}
                      setCurrentStatus={setCurrentStatus}
                    />
                  );
                }
              })}
              {isEdit && !maxStatuses && (
                <li
                  className={`${styles.item} ${styles.add}`}
                  onClick={handleAddStatus}
                >
                  <Plus size={16} />
                  Ajouter
                </li>
              )}
            </ul>
            {isEdit ? (
              <button className={styles.edit} onClick={handleEditStatus}>
                <Save size={16} />
                Appliquer
              </button>
            ) : (
              <button className={styles.edit} onClick={handleEditStatus}>
                <Pen size={16} /> Modifier les statuts
              </button>
            )}
          </div>
          <div id="modal-layout-opacity" onClick={handleIsOpen}></div>
        </>
      )}
    </div>
  );
}
