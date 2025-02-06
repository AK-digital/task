"use client";
import styles from "@/styles/components/projects/guests-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";

export default function GuestsModal({ project, setModal }) {
  const guests = project?.guests;

  console.log(guests);

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
                    <button>Révoquer</button>
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
