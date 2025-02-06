import styles from "@/styles/components/modals/tagged-users-modal.module.css";
import { isNotEmpty } from "@/utils/utils";

export default function TaggedUsersModal({ project }) {
  return (
    <div className={styles.container}>
      <ul>
        {isNotEmpty(project) &&
          project?.guests.map((guest) => {
            return <li>{guest?.firstName + " " + guest?.lastName}</li>;
          })}
      </ul>
    </div>
  );
}
