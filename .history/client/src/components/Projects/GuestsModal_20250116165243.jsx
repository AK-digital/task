"use client";
import { removeGuest, sendProjectInvitationToGuest } from "@/actions/project";
import styles from "@/styles/components/projects/guests-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function GuestsModal({ project, setModal }) {
  const [isDelete, setIsDelete] = useState(false);
  const sendProjectInvitationToGuestWithId = sendProjectInvitationToGuest.bind(
    null,
    project?._id
  );
  const removeGuestWithId = removeGuest.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    removeGuestWithId,
    initialState
  );
  const guests = project?.guests;

  useEffect(() => {}, [state]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.heading}>
          <span>Inviter d'autres utilisateurs</span>
        </div>
        <div className={styles.form}>
          <form action={formAction}>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Inviter par e-mail"
            />
            <button type="submit" hidden>
              Envoyer
            </button>
          </form>
        </div>
        {/* Guests list */}
        {isNotEmpty(guests) && (
          <div className={styles.guests}>
            <ul>
              {guests.map((guest) => {
                return (
                  <li key={guest?._id}>
                    <Image
                      src={guest?.picture || "/default-pfp.webp"}
                      width={35}
                      height={35}
                      alt={`Photo de profil de ${guest?.firstName}`}
                      style={{
                        borderRadius: "50%",
                      }}
                    />
                    <span>{guest?.email}</span>
                    <form action={formAction}>
                      <input
                        type="text"
                        name="guest-id"
                        id="guest-id"
                        defaultValue={guest?._id}
                        hidden
                      />
                      <button type="submit">Révoquer</button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div id="modal-layout" onClick={(e) => setModal(false)}></div>
    </>
  );
}
