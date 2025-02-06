"use client";
import { removeGuest } from "@/actions/project";
import styles from "@/styles/components/projects/guests-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useActionState } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function GuestsModal({ project, setModal }) {
  const removeGuestWithId = removeGuest.bind(null, project?._id);
  const [state, formAction, pending] = useActionState();
  const guests = project?.guests;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.heading}>
          <span>Inviter d'autres utilisateurs</span>
        </div>
        <div className={styles.form}>
          <form action="">
            <input type="text" placeholder="Inviter par e-mail" />
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
                    <form action="">
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
