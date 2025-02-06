import styles from "@/styles/components/modals/tagged-users-modal.module.css";
import { isNotEmpty } from "@/utils/utils";

export default function TaggedUsersModal({ project, mentionPosition }) {
  return (
    <div
      className={styles.container}
      style={{
        top: `${mentionPosition.top}px`,
        left: `${mentionPosition.left}px`,
      }}
    >
      <div>
        <span>Personnes à mentionner</span>
      </div>
      <ul>
        {!isNotEmpty(project) &&
          project?.guests?.map((guest) => {
            return <li>{"@" + guest?.firstName + " " + guest?.lastName}</li>;
          })}
      </ul>
    </div>
  );
}
