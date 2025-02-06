import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose, faCross } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function TaskMore() {
  return (
    <div className={styles.container}>
      {/* Description */}
      <div>
        <FontAwesomeIcon icon={faClose} />
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" id="description"></textarea>
      </div>
      {/* Conversation */}
      <div></div>
    </div>
  );
}
