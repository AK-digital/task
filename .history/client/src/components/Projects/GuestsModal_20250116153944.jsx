import styles from "@/styles/components/projects/guests-modal.module.css";

export default function GuestsModal({ project }) {
  const guests = project?.guests;

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
      <div></div>
    </div>
  );
}
