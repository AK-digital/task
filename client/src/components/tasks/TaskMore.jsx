"use client";
import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState, useEffect, useCallback } from "react";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import Messages from "../messages/Messages";
import { useRouter } from "next/navigation";

export default function TaskMore({ task, project }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const containerRef = useRef(null);
  const [editDescription, setEditDescription] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);

  const startResizing = useCallback((e) => {
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(containerRef.current.offsetWidth);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    setStartX(null);
    setStartWidth(null);
  }, []);

  const resize = useCallback(
    (e) => {
      if (isResizing && startX !== null && startWidth !== null) {
        const diff = startX - e.clientX;
        const maxWidth = window.innerWidth - 80; // calc(100% - 80px)
        const newWidth = Math.min(maxWidth, Math.max(300, startWidth + diff));
        containerRef.current.style.width = `${newWidth}px`;
      }
    },
    [isResizing, startX, startWidth]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const currentWidth = containerRef.current.offsetWidth;
        const maxWidth = window.innerWidth - 80;
        if (currentWidth > maxWidth) {
          containerRef.current.style.width = `${maxWidth}px`;
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClose = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.classList.add(styles["container-close"]);

    const handleAnimationEnd = () => {
      container.removeEventListener("animationend", handleAnimationEnd);
      router.push(`/project/${task?.projectId}`, { scroll: false }).then(() => {
        setOpen(false);
      });
    };

    container.addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
  }, [router, task?.projectId]);

  // Nettoyage des écouteurs d'événements lors du démontage
  useEffect(() => {
    return () => {
      const container = containerRef.current;
      if (container) {
        container.removeEventListener("animationend", () => {});
      }
    };
  }, []);

  return (
    <>
      <div className={styles.container} ref={containerRef}>
        <div className={styles.resizer} onMouseDown={startResizing}></div>
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
              className={styles.preview}
              onClick={(e) => setEditDescription(true)}
              dangerouslySetInnerHTML={{ __html: task?.description }}
            ></div>
          ) : (
            <RichTextEditor
              placeholder={"Ajouter une description à cette tâche"}
              type="description"
              task={task}
              setEditDescription={setEditDescription}
              message={null}
              edit={null}
              setEdit={null}
              project={project}
            />
          )}
        </div>
        {/* Conversation */}
        <div className={styles.conversation}>
          <Messages task={task} project={project} />
          <RichTextEditor
            placeholder={"Écrire un message"}
            type="conversation"
            task={task}
            setEditDescription={setEditDescription}
            message={null}
            edit={null}
            setEdit={null}
            project={project}
          />
        </div>
      </div>
      {open && <div onClick={handleClose} id="modal-layout"></div>}
    </>
  );
}
