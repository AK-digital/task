import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import { instrumentSans } from "@/utils/font";
export default function TaskMore({ task, setTaskMore }) {
  const [editDescription, setEditDescription] = useState(false);
  const containerRef = useRef(null);

  function handleClose(e) {
    e.preventDefault();
    const container = containerRef.current;
    container?.classList?.add(styles["container-close"]);

    container?.addEventListener("animationend", function () {
      container?.classList?.remove(styles["container-close"]); // Remove the "close" class from the container
      setTaskMore(false); // When animation ends remove set the state to false
    });
  }

  return (
    <>
      <div className={styles.container} ref={containerRef}>
        {/* Description */}
        <div className={styles.header}>
          <div>
            <span>{task?.text}</span>
          </div>
          <div>
            <FontAwesomeIcon icon={faClose} onClick={handleClose} />
          </div>
        </div>
        <div className={styles.description}>
          <span>Description</span>
          {task?.description && !editDescription ? (
            <div
              className={styles["task-more__description__text"]}
              onClick={(e) => setEditDescription(true)}
              dangerouslySetInnerHTML={{ __html: task?.description }}
            ></div>
          ) : (
            <RichTextEditor
              placeholder={"Ajouter une description à cette tâche"}
              type="description"
              task={task}
              setEditDescription={setEditDescription}
            />
          )}
        </div>
        {/* Conversation */}
        <div className={styles.conversation}>
          <span>Conversation</span>
          <RichTextEditor
            placeholder={"Écrire un message"}
            type="conversation"
            task={task}
          />
        </div>
      </div>
      <div onClick={handleClose} id="modal-layout"></div>
    </>
  );
}
