"use client";
import { removeGuest } from "@/actions/project";
import styles from "@/styles/components/modals/guests-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useActionState, useContext, useEffect, useState } from "react";
import GuestFormInvitation from "../Projects/GuestFormInvitation";
import PopupMessage from "@/layouts/PopupMessage";
import socket from "@/utils/socket";
import { AuthContext } from "@/context/auth";
import { deleteProjectInvitation } from "@/actions/projectInvitation";
import NoPicture from "../User/NoPicture";

export default function GuestsModal({
  project,
  projectInvitations,
  setIsOpen,
}) {
  const initialState = {
    status: "pending",
    message: "",
    errors: null,
    guestId: null,
  };

  const { uid } = useContext(AuthContext);
  const [isPopup, setIsPopup] = useState(null);
  const removeGuestWithId = removeGuest.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    removeGuestWithId,
    initialState
  );
  const guests = project?.guests;

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
        <GuestFormInvitation project={project} setIsPopup={setIsPopup} />
        {/* Guests list */}
        {isNotEmpty(guests) && (
          <div className={styles.guests}>
            <ul>
              <>
                {guests.map((guest) => {
                  return (
                    <li key={guest?._id}>
                      <div>
                        {guest?.picture ? (
                          <Image
                            src={guest?.picture || "/default-pfp.webp"}
                            width={32}
                            height={32}
                            alt={`Photo de profil de ${guest?.firstName}`}
                            style={{
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <NoPicture user={guest} width={32} height={32} />
                        )}
                        <span>{guest?.email}</span>
                      </div>
                      {uid === project?.author?._id && (
                        <form action={formAction}>
                          <input
                            type="text"
                            name="guest-id"
                            id="guest-id"
                            defaultValue={guest?._id}
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
              </>
            </ul>
          </div>
        )}
        {isNotEmpty(projectInvitations) && (
          <div className={styles.invitations}>
            <ul>
              <ProjectInvitationsList
                projectInvitations={projectInvitations}
                setIsPopup={setIsPopup}
                uid={uid}
                project={project}
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
  uid,
  project,
}) {
  const initialState = {
    status: "pending",
    message: "",
  };

  const [state, formAction, pending] = useActionState(
    deleteProjectInvitation,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      console.log("played");
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

  console.log(state);

  return (
    <>
      {projectInvitations.map((inv) => {
        return (
          <li key={inv?._id} className={styles.pending}>
            <div>
              <Image
                src={"/default-pfp.webp"}
                width={32}
                height={32}
                alt={`Photo de profil de ${inv?.guestEmail}`}
                style={{
                  borderRadius: "50%",
                }}
              />
              <span>{inv?.guestEmail}</span>
            </div>
            {uid === project?.author?._id && (
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
