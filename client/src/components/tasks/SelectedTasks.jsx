"use client";

import {
  addTaskToArchive,
  deleteTask,
  removeTaskFromArchive,
} from "@/api/task";
import { deleteSubtask } from "@/api/subtask";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";
import { Archive, ArchiveRestore, Trash, X } from "lucide-react";
import { useContext } from "react";

export default function SelectedTasks({
  project,
  selectedTasks,
  setSelectedTasks,
  archive,
  mutate,
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

    // Tasks is an array of task objects, extract IDs for tasks only
    const taskIds = selectedTasks.filter(item => !item.isSubtask).map(item => item._id);
    if (taskIds.length > 0) {
      await addTaskToArchive(taskIds, project?._id);
    }

    await mutate();

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  };

  const handleRemoveFromArchive = async (e) => {
    e.preventDefault();

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir restaurer cette tâche ?"
    );

    if (!confirmed) return;

    // Tasks is an array of task objects, extract IDs for tasks only
    const taskIds = selectedTasks.filter(item => !item.isSubtask).map(item => item._id);
    if (taskIds.length > 0) {
      await removeTaskFromArchive(taskIds, project?._id);
    }

    await mutate();

    socket.emit("update task", project?._id);

    setSelectedTasks([]);
  };

  async function handleDelete(e) {
    e.preventDefault();

    const confirmed = confirm(
      " Êtes-vous sûr de vouloir supprimer cette tâche ?"
    );

    if (!confirmed) return;

    try {
      // Séparer les tâches et les sous-tâches
      const tasks = [];
      const subtasks = [];
      
      selectedTasks.forEach(item => {
        if (item.isSubtask) {
          subtasks.push(item._id);
        } else {
          tasks.push(item._id);
        }
      });

      // Supprimer les tâches normales
      if (tasks.length > 0) {
        const taskRes = await deleteTask(tasks, project?._id);
        if (!taskRes?.success) {
          console.error("Erreur lors de la suppression des tâches:", taskRes?.message);
          return;
        }
      }

      // Supprimer les sous-tâches une par une
      if (subtasks.length > 0) {
        const subtaskPromises = subtasks.map(subtaskId => deleteSubtask(subtaskId));
        const subtaskResults = await Promise.all(subtaskPromises);
        
        // Vérifier que toutes les suppressions ont réussi
        const failedDeletions = subtaskResults.filter(result => !result?.success);
        if (failedDeletions.length > 0) {
          console.error("Erreur lors de la suppression de certaines sous-tâches:", failedDeletions);
          return;
        }
      }

      await mutate();
      socket.emit("update task", project?._id);
      setSelectedTasks([]);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  }

  return (
    <div className="flex fixed z-2001 left-1/2 bottom-[8%] -translate-x-1/2 bg-secondary shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-lg text-black animate-[showAnim_0.2s_ease-out]">
      {/* Main content */}
      <div className="flex items-center gap-6 pr-6">
        <div className="bg-[#2a3730] h-full text-text-color rounded-[8px_0_0_8px] font-bold text-large p-6">
          <span> {selectedTasks.length}</span>
        </div>
        <div className="text-large">
          <span>
            {selectedTasks?.length > 1
              ? "Tâches séléctionnées"
              : "Tâche séléctionnée"}
          </span>
        </div>
        {/* actions */}
        <div className="flex gap-3">
          {/* action */}
          {!archive &&
            checkRole(project, ["owner", "manager", "team"], uid) && (
              <button className="secondary-button" onClick={handleAddToArchive}>
                <Archive size={20} />
                <span>Archiver</span>
              </button>
            )}
          {archive && checkRole(project, ["owner", "manager", "team"], uid) && (
            <button className="secondary-button" onClick={handleRemoveFromArchive}>
              <ArchiveRestore size={20} />
              <span>Restaurer</span>
            </button>
          )}
          {checkRole(
            project,
            ["owner", "manager", "team", "customer"],
            uid
          ) && (
            <button className="secondary-button" onClick={handleDelete}>
              <Trash size={20} />
              <span>Supprimer</span>
            </button>
          )}
          <button className="secondary-button border-accent-color text-accent-color hover:bg-accent-color hover:text-white" onClick={handleClose}>
            <X size={20} />
            <span>Annuler</span>
          </button>
        </div>
      </div>
    </div>
  );
}
