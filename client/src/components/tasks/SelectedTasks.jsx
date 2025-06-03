"use client";

import {
  addTaskToArchive,
  deleteTask,
  removeTaskFromArchive,
} from "@/api/task";
import { AuthContext } from "@/context/auth";
import styles from "@/styles/components/tasks/selected-tasks.module.css";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";
import { Archive, ArchiveRestore, Trash, X } from "lucide-react";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export default function SelectedTasks({
  project,
  selectedTasks,
  setSelectedTasks,
  archive,
  mutate,
}) {
  const { t } = useTranslation();
  const { uid } = useContext(AuthContext);

  function handleClose(e) {
    e.preventDefault();

    const inputs = document?.getElementsByName("task");
    const checkedInputs = Array.from(inputs).filter((input) => input.checked);

    for (const checkedInput of checkedInputs) {
      checkedInput.checked = false;
    }

    setSelectedTasks([]);
  }

  const handleAddToArchive = async (e) => {
    e.preventDefault();

    const confirmed = confirm(t("tasks.archive_confirm"));

    if (!confirmed) return;

    // Tasks is an array of task ids
    await addTaskToArchive(selectedTasks, project?._id);

    await mutate();

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  };

  const handleRemoveFromArchive = async (e) => {
    e.preventDefault();

    const confirmed = confirm(t("tasks.restore_confirm"));

    if (!confirmed) return;

    // Tasks is an array of task ids
    await removeTaskFromArchive(selectedTasks, project?._id);

    await mutate();

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  };

  async function handleDelete(e) {
    e.preventDefault();

    const confirmed = confirm(t("tasks.delete_confirm"));

    if (!confirmed) return;

    // Tasks is an array of task ids
    const res = await deleteTask(selectedTasks, project?._id);

    if (!res.success) return;

    await mutate();

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  }

  return (
    <div className={styles.container}>
      {/* Main content */}
      <div className={styles.wrapper}>
        <div className={styles.count}>
          <span> {selectedTasks.length}</span>
        </div>
        <div className={styles.header}>
          <span>
            {selectedTasks?.length > 1
              ? t("tasks.selected_plural")
              : t("tasks.selected_singular")}
          </span>
        </div>
        {/* actions */}
        <div className={styles.actions}>
          {/* action */}
          {!archive &&
            checkRole(project, ["owner", "manager", "team"], uid) && (
              <div className={styles.action} onClick={handleAddToArchive}>
                <Archive size={20} />
                <span>{t("tasks.archive")}</span>
              </div>
            )}
          {archive && checkRole(project, ["owner", "manager", "team"], uid) && (
            <div className={styles.action} onClick={handleRemoveFromArchive}>
              <ArchiveRestore size={20} />
              <span>{t("tasks.restore")}</span>
            </div>
          )}
          {checkRole(
            project,
            ["owner", "manager", "team", "customer"],
            uid
          ) && (
            <div className={styles.action} onClick={handleDelete}>
              <Trash size={20} />
              <span>{t("general.delete")}</span>
            </div>
          )}
          <div className={styles.action} onClick={handleClose}>
            <X size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}
