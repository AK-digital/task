"use client";

import {
  addTaskToArchive,
  deleteTask,
  removeTaskFromArchive,
} from "@/api/task";
import { deleteSubtask } from "@/api/subtask";
import { addResponsible, updateStatus, updatePriority } from "@/actions/unified";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";
import { Archive, ArchiveRestore, Trash, Check } from "lucide-react";
import { useContext, useCallback, useMemo, memo, useState } from "react";
import UserAssignFilter from "./UserAssignFilter";
import BulkStatusFilter from "./BulkStatusFilter";
import BulkPriorityFilter from "./BulkPriorityFilter";
import ConfirmDialog from "../Modals/ConfirmDialog";

const SelectedTasks = memo(function SelectedTasks({
  project,
  selectedTasks,
  setSelectedTasks,
  archive,
  mutate,
}) {
  const { uid } = useContext(AuthContext);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: "",
    onConfirm: null
  });

  // Optimiser les calculs avec useMemo
  const { taskIds, subtaskIds, selectedCount } = useMemo(() => {
    const tasks = [];
    const subtasks = [];
    
    selectedTasks.forEach(item => {
      if (item.isSubtask) {
        subtasks.push(item._id);
      } else {
        tasks.push(item._id);
      }
    });
    
    return {
      taskIds: tasks,
      subtaskIds: subtasks,
      selectedCount: selectedTasks.length
    };
  }, [selectedTasks]);

  const handleClose = useCallback((e) => {
    e.preventDefault();
    setSelectedTasks([]);
  }, [setSelectedTasks]);

  const handleAddToArchive = useCallback((e) => {
    e.preventDefault();

    setConfirmDialog({
      isOpen: true,
      message: selectedCount > 1 
        ? `Êtes-vous sûr de vouloir archiver ces ${selectedCount} tâches ?`
        : "Êtes-vous sûr de vouloir archiver cette tâche ?",
      onConfirm: async () => {
        if (taskIds.length > 0) {
          await addTaskToArchive(taskIds, project?._id);
        }

        await mutate();
        socket.emit("update task", project?._id);
        setSelectedTasks([]);
      }
    });
  }, [taskIds, project?._id, mutate, setSelectedTasks, selectedCount]);

  const handleRemoveFromArchive = useCallback((e) => {
    e.preventDefault();

    setConfirmDialog({
      isOpen: true,
      message: selectedCount > 1 
        ? `Êtes-vous sûr de vouloir restaurer ces ${selectedCount} tâches ?`
        : "Êtes-vous sûr de vouloir restaurer cette tâche ?",
      onConfirm: async () => {
        if (taskIds.length > 0) {
          await removeTaskFromArchive(taskIds, project?._id);
        }

        await mutate();
        socket.emit("update task", project?._id);
        setSelectedTasks([]);
      }
    });
  }, [taskIds, project?._id, mutate, setSelectedTasks, selectedCount]);

  const handleAssignUsers = useCallback(async (userIds) => {
    if (!userIds || userIds.length === 0) return;

    try {
      // Attribuer les utilisateurs aux tâches et sous-tâches
      const promises = [];

      // Pour chaque utilisateur sélectionné
      for (const userId of userIds) {
        // Attribuer aux tâches normales
        for (const taskId of taskIds) {
          promises.push(addResponsible(taskId, project?._id, userId, 'task'));
        }
        
        // Attribuer aux sous-tâches
        for (const subtaskId of subtaskIds) {
          promises.push(addResponsible(subtaskId, project?._id, userId, 'subtask'));
        }
      }

      // Exécuter toutes les attributions
      const results = await Promise.all(promises);
      
      // Vérifier les erreurs
      const failedAssignments = results.filter(result => !result?.success);
      if (failedAssignments.length > 0) {
        console.error("Erreur lors de certaines attributions:", failedAssignments);
      }

      await mutate();
      socket.emit("update task", project?._id);
    } catch (error) {
      console.error("Erreur lors de l'attribution:", error);
    }
  }, [taskIds, subtaskIds, project?._id, mutate]);

  const handleStatusChange = useCallback(async (statusId) => {
    if (!statusId) return;

    try {
      // Changer le statut des tâches et sous-tâches
      const promises = [];

      // Changer le statut des tâches normales
      for (const taskId of taskIds) {
        promises.push(updateStatus(taskId, project?._id, statusId, 'task'));
      }
      
      // Changer le statut des sous-tâches
      for (const subtaskId of subtaskIds) {
        promises.push(updateStatus(subtaskId, project?._id, statusId, 'subtask'));
      }

      // Exécuter tous les changements
      const results = await Promise.all(promises);
      
      // Vérifier les erreurs
      const failedChanges = results.filter(result => !result?.success);
      if (failedChanges.length > 0) {
        console.error("Erreur lors de certains changements de statut:", failedChanges);
      }

      await mutate();
      socket.emit("update task", project?._id);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  }, [taskIds, subtaskIds, project?._id, mutate]);

  const handlePriorityChange = useCallback(async (priorityId) => {
    if (!priorityId) return;

    try {
      // Changer la priorité des tâches et sous-tâches
      const promises = [];

      // Changer la priorité des tâches normales
      for (const taskId of taskIds) {
        promises.push(updatePriority(taskId, project?._id, priorityId, 'task'));
      }
      
      // Changer la priorité des sous-tâches
      for (const subtaskId of subtaskIds) {
        promises.push(updatePriority(subtaskId, project?._id, priorityId, 'subtask'));
      }

      // Exécuter tous les changements
      const results = await Promise.all(promises);
      
      // Vérifier les erreurs
      const failedChanges = results.filter(result => !result?.success);
      if (failedChanges.length > 0) {
        console.error("Erreur lors de certains changements de priorité:", failedChanges);
      }

      await mutate();
      socket.emit("update task", project?._id);
    } catch (error) {
      console.error("Erreur lors du changement de priorité:", error);
    }
  }, [taskIds, subtaskIds, project?._id, mutate]);

  const handleDelete = useCallback((e) => {
    e.preventDefault();

    setConfirmDialog({
      isOpen: true,
      message: selectedCount > 1 
        ? `Êtes-vous sûr de vouloir supprimer ces ${selectedCount} tâches ?`
        : "Êtes-vous sûr de vouloir supprimer cette tâche ?",
      onConfirm: async () => {
        try {
          // Supprimer les tâches normales
          if (taskIds.length > 0) {
            const taskRes = await deleteTask(taskIds, project?._id);
            if (!taskRes?.success) {
              console.error("Erreur lors de la suppression des tâches:", taskRes?.message);
              return;
            }
          }

          // Supprimer les sous-tâches une par une
          if (subtaskIds.length > 0) {
            const subtaskPromises = subtaskIds.map(subtaskId => deleteSubtask(subtaskId));
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
    });
  }, [taskIds, subtaskIds, project?._id, mutate, setSelectedTasks, selectedCount]);

  return (
    <div className="flex fixed z-2001 left-1/2 bottom-[6%] -translate-x-1/2 bg-secondary shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-lg text-black animate-[showAnim_0.2s_ease-out]">
      {/* Main content */}
      <div className="flex items-center gap-6 pr-6">
        <div className="bg-[#2a3730] h-full text-text-color rounded-[8px_0_0_8px] font-bold text-large p-6">
          <span> {selectedCount}</span>
        </div>
        <div className="text-medium">
          <span>
            {selectedCount > 1
              ? "Tâches séléctionnées"
              : "Tâche séléctionnée"}
          </span>
        </div>
        
        {/* actions */}
        <div className="flex gap-3">
          {/* Attribution d'utilisateurs */}
          {checkRole(project, ["owner", "manager", "team"], uid) && (
            <UserAssignFilter 
              project={project} 
              onAssign={handleAssignUsers} 
            />
          )}

          {/* Changement de statut */}
          {checkRole(project, ["owner", "manager", "team"], uid) && (
            <BulkStatusFilter 
              project={project} 
              onStatusChange={handleStatusChange} 
            />
          )}

          {/* Changement de priorité */}
          {checkRole(project, ["owner", "manager", "team"], uid) && (
            <BulkPriorityFilter 
              project={project} 
              onPriorityChange={handlePriorityChange} 
            />
          )}
          
          {/* Archivage */}
          {!archive &&
            checkRole(project, ["owner", "manager", "team"], uid) && (
              <button className="secondary-button" onClick={handleAddToArchive}>
                <Archive size={16} />
                <span className="text-sm">Archiver</span>
              </button>
            )}
          {archive && checkRole(project, ["owner", "manager", "team"], uid) && (
            <button className="secondary-button" onClick={handleRemoveFromArchive}>
              <ArchiveRestore size={16} />
              <span className="text-sm">Restaurer</span>
            </button>
          )}
          
          {/* Suppression */}
          {checkRole(
            project,
            ["owner", "manager", "team", "customer"],
            uid
          ) && (
            <button className="secondary-button" onClick={handleDelete}>
              <Trash size={16} />
              <span className="text-sm">Supprimer</span>
            </button>
          )}
          
          {/* Terminer */}
          <button className="secondary-button border-accent-color text-accent-color hover:bg-accent-color hover:text-white" onClick={handleClose}>
            <Check size={16} />
            <span className="text-sm">Terminer</span>
          </button>
        </div>
      </div>
      {/* Modal de confirmation */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        message={confirmDialog.message}
      />
    </div>
  );
});

export default SelectedTasks;
