"use client";
import { useState } from "react";
import { Mail, X, UserPlus } from "lucide-react";
import { bricolageGrostesque } from "@/utils/font";

export default function ProjectInvitationForm({ 
  invitations = [], 
  onInvitationsChange 
}) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddInvitation = (e) => {
    e.preventDefault();
    
    // Validation
    if (!email.trim()) {
      setEmailError("L'email est requis");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Format d'email invalide");
      return;
    }
    
    // Vérifier si l'email n'est pas déjà dans la liste
    if (invitations.some(invitation => invitation.email.toLowerCase() === email.toLowerCase())) {
      setEmailError("Cet email est déjà dans la liste");
      return;
    }
    
    // Ajouter l'invitation
    const newInvitation = {
      id: Date.now(), // ID temporaire
      email: email.trim(),
    };
    
    onInvitationsChange([...invitations, newInvitation]);
    
    // Reset du formulaire
    setEmail("");
    setEmailError("");
  };

  const handleRemoveInvitation = (invitationId) => {
    onInvitationsChange(invitations.filter(invitation => invitation.id !== invitationId));
  };

  return (
    <div>
      <div className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Inviter par e-mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddInvitation(e);
            }
          }}
          className={`border-none bg-third-background-color p-2 rounded-xs transition-colors duration-5000 linear ${bricolageGrostesque.className}`}
          style={{
            WebkitTextFillColor: 'var(--text-dark-color)',
          }}
        />
        {emailError && <i className="text-text-color-red text-sm">{emailError}</i>}
        <button 
          type="button" 
          onClick={handleAddInvitation}
          className="w-full rounded-xs text-medium p-2"
        >
          Ajouter à la liste
        </button>
      </div>
      
      {/* Liste des invitations en attente */}
      {invitations.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm m-0 mb-2.5 text-text-dark-color flex items-center gap-2">
            <UserPlus size={16} />
            Invitations en attente ({invitations.length})
          </h4>
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
            {invitations.map(invitation => (
              <div 
                key={invitation.id} 
                className="flex items-center justify-between py-2 px-3 bg-secondary rounded-sm border border-border-color text-sm"
              >
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-text-color-muted" />
                  <span>{invitation.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInvitation(invitation.id)}
                  className="bg-transparent border-none text-text-color-muted cursor-pointer p-1 rounded flex items-center justify-center transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 