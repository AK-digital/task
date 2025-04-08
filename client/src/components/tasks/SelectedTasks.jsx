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
import { mutate } from "swr";

export default function SelectedTasks({
  project,
  tasks,
  setSelectedTasks,
  archive,
}) {
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

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir archiver cette tâche ?"
    );

    if (!confirmed) return;

    // Tasks is an array of task ids
    await addTaskToArchive(tasks, project?._id);

    await mutate(`/task?projectId=${project?._id}&archived=${archive}`);

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  };

  const handleRemoveFromArchive = async (e) => {
    e.preventDefault();

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir restaurer cette tâche ?"
    );

    if (!confirmed) return;

    // Tasks is an array of task ids
    await removeTaskFromArchive(tasks, project?._id);

    await mutate(`/task?projectId=${project?._id}&archived=${archive}`);

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  };

  async function handleDelete(e) {
    e.preventDefault();

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir supprimer cette tâche ?"
    );

    if (!confirmed) return;

    // Tasks is an array of task ids
    const res = await deleteTask(tasks, project?._id);

    if (!res.success) return;

    await mutate(`/task?projectId=${project?._id}&archived=${archive}`);

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  }

  return (
    <div className={styles.container}>
      {/* Main content */}
      <div className={styles.wrapper}>
        <div className={styles.count}>
          <span> {tasks.length}</span>
        </div>
        <div className={styles.header}>
          <span>
            {tasks?.length > 1 ? "Tâches séléctionnées" : "Tâche séléctionnée"}
          </span>
        </div>
        {/* actions */}
        <div className={styles.actions}>
          {/* action */}
          {!archive &&
            checkRole(project, ["owner", "manager", "team"], uid) && (
              <div className={styles.action} onClick={handleAddToArchive}>
                <Archive size={20} />
                <span>Archiver</span>
              </div>
            )}
          {archive && checkRole(project, ["owner", "manager", "team"], uid) && (
            <div className={styles.action} onClick={handleRemoveFromArchive}>
              <ArchiveRestore size={20} />
              <span>Restaurer</span>
            </div>
          )}
          {checkRole(
            project,
            ["owner", "manager", "team", "customer"],
            uid
          ) && (
            <div className={styles.action} onClick={handleDelete}>
              <Trash size={20} />
              <span>Supprimer</span>
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
