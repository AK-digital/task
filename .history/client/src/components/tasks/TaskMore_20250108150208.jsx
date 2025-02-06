import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
export default function TaskMore({ task, setTaskMore }) {
  const [writting, setWritting] = useState("");
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
        <RichTextEditor
          placeholder={"Ajouter une description à cette tâche"}
          setWritting={setWritting}
        />
        {writting && (
          <div>
            <button>Enregistrer la description</button>
            <button>An</button>
          </div>
        )}
      </div>
      {/* Conversation */}
      <div className={styles["task-more__conversation"]}>
        <label>Conversation</label>
        <RichTextEditor placeholder={"Écrire un message"} />
      </div>
    </div>
  );
}
