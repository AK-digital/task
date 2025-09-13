"use client";
import React, { useState, useEffect } from "react";
import { PenBox, Trash2 } from "lucide-react";
import Portal from "../Portal/Portal";
import ConfirmationDelete from "../Popups/ConfirmationDelete";
import { deleteTimeTracking } from "@/api/timeTracking";
import socket from "@/utils/socket";
import { extractId } from "@/utils/extractId";

export default function TimeTrackingContextMenu({ 
  isOpen, 
  setIsOpen, 
  position, 
  tracker, 
  setIsEditing,
  mutateTimeTrackings 
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showSuccessToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEditDescription = () => {
    setIsEditing(true);
    setIsOpen(false);
  };

  const handleDeleteTracker = async () => {
    try {
      const projectId = extractId(tracker?.projectId);
      const response = await deleteTimeTracking([tracker._id], projectId);

      if (!response.success) {
        console.error("Erreur lors de la suppression:", response.message);
        return;
      }

      socket.emit("update task", projectId);
      mutateTimeTrackings();
      showSuccessToast("Suivi de temps supprimé avec succès");
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

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    if (isOpen) {
      const handleClick = (e) => {
        // Ne pas fermer si on clique sur le menu lui-même
        if (!e.target.closest('.timetracking-context-menu')) {
          handleClickOutside();
        }
      };

      const handleContextMenu = (e) => {
        // Fermer ce menu si un clic droit se produit ailleurs
        if (!e.target.closest(`[data-tracker-id="${tracker._id}"]`)) {
          // Empêcher le menu contextuel du navigateur si le clic est sur un autre tracker
          if (e.target.closest('[data-tracker-id]')) {
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
  }, [isOpen, tracker._id]);

  if (!isOpen) return null;

  return (
    <>
      <Portal>
        <div
          className="timetracking-context-menu fixed z-20001 bg-secondary rounded-lg w-max text-small py-2 px-4 shadow-xl text-text-dark-color select-none border border-[#e0e0e0]"
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
          }}
        >
          <ul>
            <li
              className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light flex items-center gap-2"
              onClick={() => handleMenuClick(handleEditDescription, 'edit')}
            >
              <PenBox size={16} />
              <span>Modifier la description</span>
            </li>
            <li
              className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light last:border-b-0 text-text-color-red flex items-center gap-2"
              onClick={() => handleMenuClick(handleDeleteTracker, 'delete')}
            >
              <Trash2 size={16} />
              <span>Supprimer ce suivi</span>
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
            deletionName="ce suivi de temps"
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
