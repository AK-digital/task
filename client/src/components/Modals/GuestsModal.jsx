"use client";
import { removeGuest } from "@/actions/project";
import styles from "@/styles/components/modals/guests-modal.module.css";
import {
  isNotEmpty,
  memberRole,
  canEditMemberRole,
  canRemoveMember,
  getAvailableRoleOptions,
  getAvailableRoleOptionsForInvitation,
} from "@/utils/utils";
import Image from "next/image";
import { useActionState, useContext, useEffect, useState } from "react";
import GuestFormInvitation from "../Projects/GuestFormInvitation";
import PopupMessage from "@/layouts/PopupMessage";
import { AuthContext } from "@/context/auth";
import { deleteProjectInvitation } from "@/actions/projectInvitation";
import { useUserRole } from "@/app/hooks/useUserRole";
import { DropDown } from "../Dropdown/Dropdown";
import { useProjectInvitation } from "@/app/hooks/useProjectInvitation";
import DisplayPicture from "../User/DisplayPicture";

export default function GuestsModal({ project, setIsOpen, mutateProject }) {
  const initialState = {
    status: "pending",
    message: "",
    errors: null,
    guestId: null,
  };

  const { projectInvitations, mutateProjectInvitation } = useProjectInvitation(
    project?._id
  );
  const { uid } = useContext(AuthContext);
  const [isPopup, setIsPopup] = useState(null);
  const removeGuestWithId = removeGuest.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    removeGuestWithId,
    initialState
  );
  const canInvite = useUserRole(project, ["owner", "manager"]);

  const members = project?.members;

  useEffect(() => {
    if (isPopup) {
      const timeout = setTimeout(() => {
        setIsPopup(null);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [isPopup]);

  useEffect(() => {
    if (state?.status === "success") {
      mutateProject();
      setIsPopup({
        status: state?.status,
        title: "Utilisateur révoqué avec succès",
        message: state?.message,
      });
    }

    if (state?.status === "failure" && state?.errors === null) {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message: state?.message,
      });
    }
  }, [state]);

  return (
    <>
      <div className={styles.container} id="modal">
        <div className={styles.heading}>
          <span>Inviter d'autres utilisateurs</span>
        </div>
        {canInvite && (
          <GuestFormInvitation
            project={project}
            setIsPopup={setIsPopup}
            mutateProjectInvitation={mutateProjectInvitation}
          />
        )}
        {/* Guests list */}
        {isNotEmpty(members) && (
          <div className={styles.guests}>
            <ul>
              {members.map((member) => {
                const availableOptions = getAvailableRoleOptions(
                  project,
                  member,
                  uid
                );
                return (
                  <li key={member?.user?._id} className={styles.member}>
                    <div className={styles.user}>
                      <DisplayPicture
                        user={member?.user}
                        style={{
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                        }}
                      />
                      <span
                        className={styles.email}
                        title={member?.user?.email}
                      >
                        {member?.user?.email}
                      </span>
                      {canEditMemberRole(project, member, uid) &&
                      member?.user?._id !== uid &&
                      availableOptions.length > 0 ? (
                        <DropDown
                          defaultValue={member?.role}
                          options={availableOptions}
                          project={project}
                          member={member}
                        />
                      ) : (
                        <div className={styles.role}>
                          <span>{memberRole(member?.role)}</span>
                        </div>
                      )}
                    </div>
                    {canRemoveMember(project, member, uid) && (
                      <form action={formAction}>
                        <input
                          type="text"
                          name="guest-id"
                          id="guest-id"
                          defaultValue={member?.user?._id}
                          hidden
                        />
                        <button
                          type="submit"
                          data-disabled={pending}
                          disabled={pending}
                        >
                          Révoquer
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {isNotEmpty(projectInvitations) && (
          <div className={styles.invitations}>
            <ul>
              <ProjectInvitationsList
                projectInvitations={projectInvitations}
                setIsPopup={setIsPopup}
                project={project}
                mutateProjectInvitation={mutateProjectInvitation}
              />
            </ul>
          </div>
        )}
      </div>
      <div id="modal-layout" onClick={(e) => setIsOpen(false)}></div>
      {isPopup && (
        <PopupMessage
          status={isPopup?.status}
          title={isPopup?.title}
          message={isPopup?.message}
        />
      )}
    </>
  );
}

export function ProjectInvitationsList({
  projectInvitations,
  setIsPopup,
  project,
  mutateProjectInvitation,
}) {
  const initialState = {
    status: "pending",
    message: "",
  };

  const [state, formAction, pending] = useActionState(
    deleteProjectInvitation,
    initialState
  );

  const { uid } = useContext(AuthContext);
  const canDelete = useUserRole(project, ["owner", "manager"]);
  const canEditRole = useUserRole(project, ["owner", "manager"]);

  useEffect(() => {
    if (state?.status === "success") {
      mutateProjectInvitation();
      setIsPopup({
        status: state?.status,
        title: "Invitation annulée avec succès",
        message: state?.message || "L'invitation a été annulée avec succès",
      });
    }
    if (state?.status === "failure") {
      setIsPopup({
        status: state?.status,
        title: "Une erreur s'est produite",
        message:
          state?.message ||
          "Une erreur s'est produite lors de l'annulation de l'invitation",
      });
    }
  }, [state]);

  return (
    <>
      {projectInvitations.map((inv) => {
        const availableOptions = getAvailableRoleOptionsForInvitation(
          project,
          inv,
          uid
        );
        return (
          <li key={inv?._id} className={styles.pending}>
            <div>
              <Image
                src={"/default-pfp.webp"}
                width={32}
                height={32}
                alt={`Photo de profil de ${inv?.guestEmail}`}
                style={{ borderRadius: "50%" }}
              />
              <span>{inv?.guestEmail}</span>
              {canEditRole && availableOptions.length > 0 && (
                <DropDown
                  defaultValue={inv?.role}
                  options={availableOptions}
                  invitation={inv}
                  project={project}
                />
              )}
              {(!canEditRole || availableOptions.length === 0) && (
                <div className={styles.role}>
                  <span>{memberRole(inv?.role)}</span>
                </div>
              )}
            </div>
            {canDelete && (
              <form action={formAction}>
                <input
                  type="text"
                  name="project-invitation-id"
                  id="project-invitation-id"
                  defaultValue={inv?._id}
                  hidden
                />
                <input
                  type="text"
                  name="project-id"
                  id="project-id"
                  defaultValue={inv?.projectId}
                  hidden
                />
                <button
                  type="submit"
                  data-disabled={pending}
                  disabled={pending}
                >
                  Annuler
                </button>
              </form>
            )}
          </li>
        );
      })}
    </>
  );
}
