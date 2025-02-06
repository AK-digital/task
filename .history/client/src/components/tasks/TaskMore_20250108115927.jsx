import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
export default function TaskMore({ setTaskMore }) {
  const containerRef = useRef(null);

  function handleClose(e) {
    e.preventDefault();
    const container = containerRef.current;
    container?.classList?.add(styles.close);

    container?.addEventListener("animationend", function () {
      container?.classList?.remove(styles.close); // Remove the "close" class from the container
      setTaskMore(false); // When animation ends remove set the state to false
    });
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
