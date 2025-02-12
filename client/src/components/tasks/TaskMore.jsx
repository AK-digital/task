"use client";
import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState, useEffect, useCallback } from "react";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import Messages from "../messages/Messages";
import { useRouter } from "next/navigation";
import Image from "next/image";
import moment from "moment";

export default function TaskMore({ task, project, setOpennedTask }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const containerRef = useRef(null);
  const [editDescription, setEditDescription] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);

  const descriptionAuthor = task?.description?.author;

  const isUpdated =
    task?.description?.createdAt !== task?.description?.updatedAt;

  const date = moment(task?.description?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

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

  const handleClose = () => {
    const container = containerRef.current;
    if (!container) return;

    container.classList.add(styles["container-close"]);

    const handleAnimationEnd = async () => {
      container.removeEventListener("animationend", handleAnimationEnd);
      window.history.pushState({}, "", `/project/${project?._id}`);
      setOpennedTask(null);
      setOpen(false);
    };

    container.addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
  };

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
          {task?.description?.text && !editDescription ? (
            <div
              onClick={(e) => setEditDescription(true)}
              className={styles.edit}
            >
              <div className={styles.user}>
                <Image
                  src={descriptionAuthor?.picture || "/default-pfp.webp"}
                  width={35}
                  height={35}
                  alt={`Photo de profil de ${descriptionAuthor?.firstName}`}
                  style={{ borderRadius: "50%" }}
                />
                <span className={styles.names}>
                  {descriptionAuthor?.firstName +
                    " " +
                    descriptionAuthor?.lastName}
                </span>
                {task?.description?.createdAt && (
                  <>
                    <span className={styles.date}>{formattedDate}</span>
                    {isUpdated && (
                      <span className={styles.updated}>Modifié</span>
                    )}
                  </>
                )}
              </div>
              <div
                className={styles.preview}
                dangerouslySetInnerHTML={{ __html: task?.description?.text }}
              ></div>
            </div>
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
          <span className={styles.conversationTitle}>Conversation</span>
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
      {open && <div onClick={handleClose} id="task-modal-layout"></div>}
    </>
  );
}
