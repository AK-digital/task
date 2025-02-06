"use client";
import { removeGuest } from "@/actions/project";
import styles from "@/styles/components/projects/guests-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import GuestFormInvitation from "./GuestFormInvitation";
import PopupMessage from "@/layouts/PopupMessage";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function GuestsModal({ project, setIsOpen }) {
  const [isPopup, setIsPopup] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const removeGuestWithId = removeGuest.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    removeGuestWithId,
    initialState
  );
  const guests = project?.guests;

  useEffect(() => {
    if (state?.status === "success") {
      setTitle("Utilisateur révoqué avec succès");
      setStatus("success");
      setIsPopup(true);
    }
    if (state?.status === "failure") {
      setTitle("Une erreur s'est produite");
      setStatus("failure");
      setIsPopup(true);
    }

    setMessage(state?.message);

    const timeout = setTimeout(() => {
      setIsPopup(false);
    }, 4000);

    clearTimeout(timeout);
  }, [state]);

  return (
    <>
      <div className={styles.container} id="modal">
        <div className={styles.heading}>
          <span>Inviter d'autres utilisateurs</span>
        </div>
        <GuestFormInvitation project={project} />
        {/* Guests list */}
        {isNotEmpty(guests) && (
          <div className={styles.guests}>
            <ul>
              {guests.map((guest) => {
                return (
                  <li key={guest?._id}>
                    <div>
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
                    </div>
                    <form action={formAction}>
                      <input
                        type="text"
                        name="guest-id"
                        id="guest-id"
                        defaultValue={guest?._id}
                        hidden
                      />
                      <button type="submit" data-disabled={pending}>
                        Révoquer
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div id="modal-layout" onClick={(e) => setIsOpen(false)}></div>
      {status && (
        <PopupMessage status={status} title={title} message={message} />
      )}
    </>
  );
}
