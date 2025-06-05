"use client";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function ProjectInvitationForm({ 
  onInvitationsChange, 
  disabled = false 
}) {
  const [invitations, setInvitations] = useState([]);
  const [newEmail, setNewEmail] = useState("");

  const handleAddInvitation = (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !isValidEmail(newEmail)) return;

    const newInvitation = {
      email: newEmail.trim(),
      id: Date.now() // Simple ID for React keys
    };

    const updatedInvitations = [...invitations, newInvitation];
    setInvitations(updatedInvitations);
    setNewEmail("");
    onInvitationsChange(updatedInvitations);
  };

  const handleRemoveInvitation = (invitationId) => {
    const updatedInvitations = invitations.filter(inv => inv.id !== invitationId);
    setInvitations(updatedInvitations);
    onInvitationsChange(updatedInvitations);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className="bg-white/50 rounded-lg p-8">
      <div className="text-lg font-medium mb-5">
        <span>Gestion de l'équipe</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {/* Liste des invitations */}
        {invitations.map((invitation) => (
          <div key={invitation.id} className="flex items-center gap-2 p-2 bg-primary rounded-md">
            <span className="flex-1 text-sm text-text-dark">{invitation.email}</span>
            <button
              onClick={() => handleRemoveInvitation(invitation.id)}
              className="bg-transparent border-none text-text-muted cursor-pointer p-1 rounded hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              disabled={disabled}
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Formulaire d'ajout */}
        <form onSubmit={handleAddInvitation} className="flex gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email@exemple.com"
            className="flex-1 border-none bg-third py-2 px-2 rounded-xs text-base focus:outline-none"
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={disabled || !newEmail.trim() || !isValidEmail(newEmail)}
            className="w-full rounded-xs text-base py-2 px-2 bg-accent text-white border-none cursor-pointer transition-all duration-200 hover:bg-accent-hover disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Plus size={16} className="inline mr-1" />
            Inviter
          </button>
        </form>

        {invitations.length > 0 && (
          <div className="mt-5 text-sm text-text-muted">
            <p className="m-0">💡 Les invitations seront envoyées après la création du projet</p>
          </div>
        )}
      </div>
    </div>
  );
} 