import styles from "@/styles/components/task/task-priority.module.css";
import { updateTaskPriority } from "@/actions/task";
import { useCallback, useMemo, useState } from "react";
import socket from "@/utils/socket";
import { useUserRole } from "@/app/hooks/useUserRole";
import { Pen, Plus, Save } from "lucide-react";
import { useProjectContext } from "@/context/ProjectContext";
import TaskEditPriority from "./TaskEditPriority";
import { savePriority } from "@/api/priority";
import { priorityColors } from "@/utils/utils";
import { getFloating, usePreventScroll } from "@/utils/floating";
import { useTranslation } from "react-i18next";

export default function TaskPriority({ task }) {
  const { t } = useTranslation();
  const { project, mutateTasks, priorities, mutatePriorities } =
    useProjectContext();
  const [currentPriority, setCurrentPriority] = useState(task?.priority);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const maxPriorities = priorities?.length === 12;

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

  async function handleTaskUpdatePriority(priority) {
    if (!canEdit) return;

    setCurrentPriority(priority);
    setIsOpen(false);

    const response = await updateTaskPriority(
      task?._id,
      project?._id,
      priority?._id
    );

    if (response?.status === "failure") {
      setCurrentPriority(task?.priority);
      return;
    }

    socket.emit("update task", project?._id);

    mutateTasks();
    mutatePriorities();
  }

  async function handleAddPriority() {
    if (!canEdit) return;

    // Get a random color for the new priority and prevent duplicates colors from priorities
    const existingColors = priorities.map((priority) => priority?.color);
    const availableColors = priorityColors.filter(
      (color) => !existingColors.includes(color)
    );
    const randomColor =
      availableColors[Math.floor(Math.random() * availableColors?.length)];

    const response = await savePriority(project?._id, {
      name: t("tasks.new_priority"),
      color: randomColor,
    });

    if (!response?.success) {
      console.error("Failed to save priority:", response.message);
      return;
    }

    mutatePriorities();
  }

  const handleIsOpen = useCallback(() => {
    if (!canEdit) return;

    setIsOpen((prev) => !prev);
    setIsEdit(false);
  }, [canEdit]);

  function handleEditPriority() {
    if (!canEdit) return;

    setIsEdit((prev) => !prev);
  }

  useMemo(() => {
    setCurrentPriority(task?.priority);
  }, [task?.priority]);

  const hasPriority = currentPriority?.name;
  const currentBackgroundColor = hasPriority
    ? currentPriority?.color
    : "#afbde9";

  function listWidth() {
    if (isEdit && priorities?.length > 5) {
      return true;
    } else if (!isEdit && priorities?.length > 6) {
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
        ref={refs.setReference}
      >
        <span>{currentPriority?.name || t("tasks.low_priority")}</span>
      </div>
      {isOpen && (
        <>
          <div
            className={styles.list}
            data-big={listWidth()}
            ref={refs.setFloating}
            style={floatingStyles}
          >
            <ul className={styles.items}>
              {priorities?.map((priority) => {
                if (!isEdit) {
                  return (
                    <li
                      key={priority?._id}
                      className={styles.item}
                      data-value={priority?.name}
                      onClick={() => handleTaskUpdatePriority(priority)}
                      style={{ backgroundColor: priority?.color }}
                    >
                      {priority?.name}
                    </li>
                  );
                } else {
                  return (
                    <TaskEditPriority
                      key={priority?._id}
                      priority={priority}
                      currentPriority={currentPriority}
                      setCurrentPriority={setCurrentPriority}
                    />
                  );
                }
              })}
              {isEdit && !maxPriorities && (
                <li
                  className={`${styles.item} ${styles.add}`}
                  onClick={handleAddPriority}
                >
                  <Plus size={16} />
                  {t("tasks.add")}
                </li>
              )}
            </ul>
            {isEdit ? (
              <button className={styles.edit} onClick={handleEditPriority}>
                <Save size={16} />
                {t("tasks.apply")}
              </button>
            ) : (
              <button className={styles.edit} onClick={handleEditPriority}>
                <Pen size={16} /> {t("tasks.edit_priorities")}
              </button>
            )}
          </div>
          <div id="modal-layout-opacity" onClick={handleIsOpen}></div>
        </>
      )}
    </div>
  );
}
