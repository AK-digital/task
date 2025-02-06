"use client";
import styles from "@/styles/components/projects/guests-modal.module.css";
import { isNotEmpty } from "@/utils/utils";

export default function GuestsModal({ project }) {
  const guests = project?.guests;

  console.log(guests);

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <span>Inviter d'autres utilisateurs</span>
      </div>
      <div className={styles.form}>
        <form action="">
          <input type="text" />
        </form>
      </div>
      {/* Guests list */}
      {isNotEmpty(guests) && (
        <div className={styles.guests}>
          <ul>
            {guests.map((guest) => {
              return <li key={guest?._id}></li>;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
