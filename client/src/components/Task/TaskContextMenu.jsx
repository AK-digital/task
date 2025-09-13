"use client";
import React, { useState, useEffect } from "react";
import { Archive, Trash2, ExternalLink, Link, Copy, CopyPlus } from "lucide-react";
import Portal from "../Portal/Portal";
import ConfirmationDelete from "../Popups/ConfirmationDelete";
import { addTaskToArchive, deleteTask, createTask } from "@/api/task";
import { useTaskContext } from "@/context/TaskContext";

export default function TaskContextMenu({ 
  isOpen, 
  setIsOpen, 
  position, 
  task, 
  mutate 
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const { setOpenedTask } = useTaskContext();

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleOpenTask = () => {
    setOpenedTask(task._id);
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      const projectId = task.projectId._id || task.projectId;
      const url = `${window.location.origin}/projects/${projectId}/task/${task._id}`;
      await navigator.clipboard.writeText(url);
      showSuccessToast("Lien copié dans le presse-papiers");
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de la copie du lien:", error);
    }
  };

  const handleCopyTitle = async () => {
    try {
      await navigator.clipboard.writeText(task.text);
      showSuccessToast("Titre copié dans le presse-papiers");
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de la copie du titre:", error);
    }
  };

  const handleDuplicateTask = async () => {
    try {
      // Créer une copie de la tâche avec un nouveau titre
      const duplicatedTaskData = {
        text: `${task.text} (copie)`,
        boardId: task.boardId,
        // Optionnel : copier d'autres propriétés si nécessaire
        // description: task.description,
        // priority: task.priority,
        // status: task.status,
      };

      const result = await createTask(duplicatedTaskData, task.projectId._id);
      
      if (result.success) {
        showSuccessToast("Tâche dupliquée avec succès");
        mutate(); // Rafraîchir la liste des tâches
      } else {
        console.error("Erreur lors de la duplication:", result.message);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de la duplication:", error);
    }
  };

  const handleArchiveTask = async () => {
    try {
      await addTaskToArchive([task._id], task.projectId._id);
      mutate();
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'archivage:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await deleteTask([task._id], task.projectId._id);
      mutate();
      setIsOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleMenuClick = (action, type) => {
    if (type === 'delete') {
      setActionType('delete');
      setPendingAction(() => action);
      setConfirmOpen(true);
    } else {
      action();
    }
  };

  const handleConfirm = () => {
    pendingAction?.();
    setConfirmOpen(false);
    setIsOpen(false);
  };

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  // Fermer le menu si on clique ailleurs ou si un autre menu contextuel s'ouvre
  useEffect(() => {
    if (isOpen) {
      const handleClick = (e) => {
        // Ne pas fermer si on clique sur le menu lui-même
        if (!e.target.closest('.task-context-menu')) {
          handleClickOutside();
        }
      };

      const handleContextMenu = (e) => {
        // Fermer ce menu si un clic droit se produit ailleurs
        if (!e.target.closest(`[data-task-id="${task._id}"]`)) {
          // Ne pas ouvrir le menu contextuel si le clic est sur container_TaskMore
          if (e.target.closest('.container_TaskMore')) {
            return; // Laisser le comportement par défaut du navigateur
          }
          
          // Ne pas ouvrir le menu contextuel si le clic est sur un FloatingMenu
          if (e.target.closest('[data-floating-menu]')) {
            return; // Laisser le comportement par défaut du navigateur
          }
          
          // Empêcher le menu contextuel du navigateur si le clic est sur une autre tâche
          if (e.target.closest('[data-task-id]')) {
            e.preventDefault();
          }
          handleClickOutside();
        }
      };
      
      document.addEventListener('click', handleClick);
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [isOpen, task._id]);

  if (!isOpen) return null;

  return (
    <>
      <Portal>
        <div
          className="task-context-menu fixed z-20001 bg-secondary rounded-lg w-max text-small py-2 px-4 shadow-xl text-text-dark-color select-none border border-[#e0e0e0]"
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
          }}
        >
          <ul>
            <li
              className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light flex items-center gap-2"
              onClick={() => handleMenuClick(handleOpenTask, 'open')}
            >
              <ExternalLink size={16} />
              <span>Ouvrir la tâche</span>
            </li>
            <li
              className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light flex items-center gap-2"
              onClick={() => handleMenuClick(handleCopyLink, 'copy')}
            >
              <Link size={16} />
              <span>Copier le lien vers la tâche</span>
            </li>
            <li
              className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light flex items-center gap-2"
              onClick={() => handleMenuClick(handleCopyTitle, 'copy')}
            >
              <Copy size={16} />
              <span>Copier le titre de la tâche</span>
            </li>
            <li
              className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light flex items-center gap-2"
              onClick={() => handleMenuClick(handleDuplicateTask, 'duplicate')}
            >
              <CopyPlus size={16} />
              <span>Dupliquer la tâche</span>
            </li>
            <li
              className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light flex items-center gap-2"
              onClick={() => handleMenuClick(handleArchiveTask, 'archive')}
            >
              <Archive size={16} />
              <span>Archiver la tâche</span>
            </li>
            <li
              className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light last:border-b-0 text-text-color-red flex items-center gap-2"
              onClick={() => handleMenuClick(handleDeleteTask, 'delete')}
            >
              <Trash2 size={16} />
              <span>Supprimer la tâche</span>
            </li>
          </ul>
        </div>
        <div className="modal-layout-opacity" onClick={handleClickOutside}></div>
      </Portal>
      
      {confirmOpen && (
        <Portal>
          <ConfirmationDelete
            isOpen={confirmOpen}
            setIsOpen={setConfirmOpen}
            onConfirm={handleConfirm}
            deletionName={task?.text}
            project={false}
          />
        </Portal>
      )}

      {/* Toast de notification */}
      {showToast && (
        <Portal>
          <div className="fixed top-4 right-4 z-[20002] bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            {toastMessage}
          </div>
        </Portal>
      )}
    </>
  );
}
