"use client";
import { useState } from "react";
import { Mail, X, UserPlus } from "lucide-react";
import { bricolageGrostesque } from "@/utils/font";
import { useTranslation } from "react-i18next";

export default function ProjectInvitationForm({
  invitations = [],
  onInvitationsChange,
}) {
  const { t } = useTranslation();
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
      setEmailError(t("newProject.invitation_email_required"));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t("newProject.invitation_email_invalid"));
      return;
    }

    // Vérifier si l'email n'est pas déjà dans la liste
    if (
      invitations.some(
        (invitation) => invitation.email.toLowerCase() === email.toLowerCase()
      )
    ) {
      setEmailError(t("newProject.invitation_email_duplicate"));
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
    onInvitationsChange(
      invitations.filter((invitation) => invitation.id !== invitationId)
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          id="email"
          placeholder={t("newProject.invitation_email_placeholder")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddInvitation(e);
            }
          }}
          className={`border-none bg-third-background-color p-2 rounded-xs transition-colors duration-5000 linear ${bricolageGrostesque.className}`}
          style={{
            WebkitTextFillColor: "var(--text-dark-color)",
          }}
        />
        {emailError && (
          <i className="text-text-color-red text-sm">{emailError}</i>
        )}
        <button
          type="button"
          onClick={handleAddInvitation}
          className="w-full rounded-xs text-medium p-2"
        >
          {t("newProject.invitation_add_button")}
        </button>
      </div>

      {/* Liste des invitations en attente */}
      {invitations.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm m-0 mb-2.5 text-text-dark-color flex items-center gap-2">
            <UserPlus size={16} />
            {t("newProject.invitation_pending_list", {
              count: invitations.length,
            })}
          </h4>
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
            {invitations.map((invitation) => (
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
