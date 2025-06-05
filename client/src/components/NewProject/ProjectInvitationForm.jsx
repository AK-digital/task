"use client";
import { useState } from "react";
import { Mail, X, UserPlus } from "lucide-react";
import styles from "@/styles/components/projects/guest-form-invitation.module.css";
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
    <div className={styles.container}>
      <div>
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
          className={bricolageGrostesque.className}
        />
        {emailError && <i style={{ color: 'var(--text-color-red)', fontSize: '0.85rem' }}>{emailError}</i>}
        <button type="button" onClick={handleAddInvitation}>
          Ajouter à la liste
        </button>
      </div>
      
      {/* Liste des invitations en attente */}
      {invitations.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ 
            fontSize: '0.95rem', 
            margin: '0 0 10px 0', 
            color: 'var(--text-dark-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <UserPlus size={16} />
            Invitations en attente ({invitations.length})
          </h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {invitations.map(invitation => (
              <div 
                key={invitation.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--secondary-background-color)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} style={{ color: 'var(--text-color-muted)' }} />
                  <span>{invitation.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveInvitation(invitation.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-color-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#fee';
                    e.target.style.color = '#c00';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--text-color-muted)';
                  }}
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