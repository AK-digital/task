import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function TaskMore({ setTaskMore }) {
  function handleClose(e) {
    e.preventDefault();
    e.target.classList.add(styles.close);
  }
  return (
    <div className={styles.container}>
      {/* Description */}
      <div onClick={(e) => setTaskMore(false)}>
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
