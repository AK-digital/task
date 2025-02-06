import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
export default function TaskMore({ task, setTaskMore }) {
  const containerRef = useRef(null);

  function handleClose(e) {
    e.preventDefault();
    const container = containerRef.current;
    container?.classList?.add(styles["task-more__container-close"]);

    container?.addEventListener("animationend", function () {
      container?.classList?.remove(styles["task-more__container-close"]); // Remove the "close" class from the container
      setTaskMore(false); // When animation ends remove set the state to false
    });
  }

  return (
    <div className={styles["task-more__container"]} ref={containerRef}>
      {/* Description */}
      <div className={styles["task-more__header"]}>
        <div>
          <span>{task?.text}</span>
        </div>
        <div>
          <FontAwesomeIcon icon={faClose} onClick={handleClose} />
        </div>
      </div>
      <div className={styles["task-more__description"]}>
        <label>Description</label>
        <textarea name="description" id="description"></textarea>
      </div>
      {/* Conversation */}
      <div>
        <label>Conversation</label>
        <textarea name="conversation" id="conversation"></textarea>
      </div>
    </div>
  );
}
