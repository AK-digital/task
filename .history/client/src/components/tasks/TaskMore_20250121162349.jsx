"use client";
import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import { instrumentSans } from "@/utils/font";

export default function TaskMore({ task, setTaskMore }) {
  const containerRef = useRef(null);

  function handleClose(e) {
    e.preventDefault();
    const container = containerRef.current;
    container?.classList?.add(styles["task-more__container-close"]);

    container?.addEventListener("animationend", function () {
      container?.classList?.remove(styles["task-more__container-close"]);
      setTaskMore(false);
    });
  }

  return (
    <div className={styles["task-more__container"]} ref={containerRef}>
      <div className={styles["task-more__header"]}>
        <div>
          <span>{task?.text}</span>
        </div>
        <div>
          <FontAwesomeIcon icon={faClose} onClick={handleClose} />
        </div>
      </div>
      <div className={styles["task-more__description"]}>
        <span>Description</span>
        {task?.description ? (
          <div className={styles["task-more__description__text"]}>
            <pre className={instrumentSans.className}>{task?.description}</pre>
          </div>
        ) : (
          <RichTextEditor
            placeholder={"Ajouter une description à cette tâche"}
            type="description"
          />
        )}
      </div>
      <div className={styles["task-more__conversation"]}>
        <span>Conversation</span>
        <RichTextEditor placeholder={"Écrire un message"} type="conversation" />
      </div>
    </div>
  );
}
