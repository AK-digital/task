"use client";

import {
  addTaskToArchive,
  deleteTask,
  removeTaskFromArchive,
} from "@/api/task";
import styles from "@/styles/components/tasks/selected-tasks.module.css";
import { Archive, ArchiveRestore, Trash, X } from "lucide-react";

export default function SelectedTasks({
  project,
  tasks,
  setSelectedTasks,
  archive,
}) {
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

    setSelectedTasks([]);
  };

  async function handleDelete(e) {
    e.preventDefault();

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir supprimer cette tâche ?"
    );

    if (!confirmed) return;

    // Tasks is an array of task ids
    await deleteTask(tasks, project?._id);

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
          <span>Tâche séléctionné(s)</span>
        </div>
        {/* actions */}
        <div className={styles.actions}>
          {/* action */}
          {!archive && (
            <div className={styles.action} onClick={handleAddToArchive}>
              <Archive size={20} />
              <span>Archiver</span>
            </div>
          )}
          {archive && (
            <div className={styles.action} onClick={handleRemoveFromArchive}>
              <ArchiveRestore size={20} />
              <span>Restaurer</span>
            </div>
          )}
          <div className={styles.action} onClick={handleDelete}>
            <Trash size={20} />
            <span>Supprimer</span>
          </div>
          <div className={styles.action} onClick={handleClose}>
            <X size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}
