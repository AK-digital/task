import styles from "@/styles/components/modals/tagged-users-modal.module.css";
import { isNotEmpty } from "@/utils/utils";

export default function TaggedUsersModal({ project }) {
  return (
    <div
      className={styles.container}
      style={{
        position: "absolute",
        top: `${mentionPosition.top}px`,
        left: `${mentionPosition.left}px`,
        zIndex: 1000,
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        padding: "8px",
        minWidth: "200px",
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      <ul>
        {isNotEmpty(project) &&
          project?.guests.map((guest) => {
            return <li>{guest?.firstName + " " + guest?.lastName}</li>;
          })}
      </ul>
    </div>
  );
}
