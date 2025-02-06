import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
export default function TaskMore({ setTaskMore }) {
  const containerRef = useRef(null);

  function handleClose(e) {
    e.preventDefault();
    const container = containerRef.current;

    parentElt?.classList.add(styles.close);
  }
  return (
    <div className={styles.container} ref={containerRef}>
      {/* Description */}
      <div onClick={handleClose}>
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
