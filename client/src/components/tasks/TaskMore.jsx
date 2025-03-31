"use client";
import styles from "@/styles/components/tasks/task-more.module.css";
import { useRef, useState, useEffect, useCallback, useContext } from "react";
import Messages from "../messages/Messages";
import Image from "next/image";
import moment from "moment";
import { MessagesSquareIcon, PanelTop } from "lucide-react";
import socket from "@/utils/socket";
import { bricolageGrostesque } from "@/utils/font";
import { updateTaskDescription } from "@/api/task";
import Tiptap from "../RichTextEditor/Tiptap";
import { AuthContext } from "@/context/auth";
import { set } from "zod";

moment.locale("fr");

export default function TaskMore({ task, project, setOpennedTask, archive }) {
  const { uid } = useContext(AuthContext);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(true);
  const containerRef = useRef(null);
  const [convOpen, setConvOpen] = useState(false);
  const [optimisticDescription, setOptimisticDescription] = useState(
    task?.description?.text
  );
  const [editDescription, setEditDescription] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);

  const descriptionAuthor = task?.description?.author;

  const date = moment(task?.description?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  useEffect(() => {
    setOptimisticDescription(task?.description?.text);
  }, [task?.description?.text]);

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

  const handleRemoveDescription = async () => {
    setPending(true);

    const response = await updateTaskDescription(
      task?._id,
      task?.projectId,
      "",
      []
    );

    // Handle error
    if (!response?.success) {
      setOptimisticDescription("");
      setPending(false);
      return;
    }

    setEditDescription(true);
    setOptimisticDescription(""); // Optimistic update
    setPending(false);

    // Update description for every guests
    socket.emit("update task", task?.projectId);
  };

  const handleClose = () => {
    const container = containerRef.current;
    if (!container) return;

    container.classList.add(styles["container-close"]);

    const handleAnimationEnd = async () => {
      container.removeEventListener("animationend", handleAnimationEnd);
      window.history.pushState(
        {},
        "",
        archive
          ? `/projects/${project?._id}/archive`
          : `/projects/${project?._id}`
      );
      setOpennedTask(null);
      setOpen(false);
    };

    container.addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
  };

  const handleEditDescription = () => {
    if (task?.description?.author?._id !== uid) {
      return;
    }

    setEditDescription(true);
  };
  return (
    <>
      <div className={styles.container} ref={containerRef} id="task-more">
        <div className={styles.resizer} onMouseDown={startResizing}></div>
        {/* Description */}
        <div className={styles.header}>
          <p className={styles.task}>{task?.text}</p>
          <span className={styles.author}>
            Par{" "}
            <Image
              src={task?.author?.picture || "/default-pfp.webp"}
              width={20}
              height={20}
              alt={`Photo de profil de ${task?.author?.firstName}`}
              style={{
                borderRadius: "50%",
              }}
            />{" "}
            {task?.author
              ? task?.author?.firstName + " " + task?.author?.lastName
              : "Ancien utilisateur"}{" "}
            le {moment(task?.createdAt).format("DD/MM/YYYY")}
          </span>
        </div>
        <div className={styles.wrapper}>
          <span className={styles.title}>
            <PanelTop size={16} /> Description
          </span>
          {optimisticDescription && !editDescription ? (
            <div className={styles.description}>
              <div className={styles.preview} onClick={handleEditDescription}>
                <div className={styles.user}>
                  <Image
                    src={descriptionAuthor?.picture || "/default-pfp.webp"}
                    width={24}
                    height={24}
                    alt={`Photo de profil de ${descriptionAuthor?.firstName}`}
                    style={{ borderRadius: "50%" }}
                  />
                  <span className={styles.names}>
                    {descriptionAuthor?.firstName +
                      " " +
                      descriptionAuthor?.lastName}
                  </span>
                  {task?.description?.createdAt && (
                    <span className={styles.date}>{formattedDate}</span>
                  )}
                </div>
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: optimisticDescription }}
                ></div>
              </div>
              {task?.description?.author?._id === uid && (
                <div className={styles.actions}>
                  <button
                    className={bricolageGrostesque.className}
                    data-disabled={pending}
                    disabled={pending}
                    onClick={handleRemoveDescription}
                  >
                    Effacer la description
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Tiptap
              project={project}
              task={task}
              type="description"
              setEditDescription={setEditDescription}
              optimisticDescription={optimisticDescription}
              setOptimisticDescription={setOptimisticDescription}
            />
          )}
        </div>
        {/* Conversation */}
        <div className={styles.wrapper}>
          <span className={styles.title}>
            <MessagesSquareIcon size={18} /> Conversation
          </span>
          <Messages task={task} project={project} />
          {convOpen ? (
            <Tiptap
              project={project}
              task={task}
              type="message"
              setConvOpen={setConvOpen}
            />
          ) : (
            <div
              className={styles.conversation}
              onClick={() => setConvOpen(true)}
            >
              <p>Rédiger une réponse et mentionner des utilisateurs avec @</p>
            </div>
          )}
        </div>
      </div>
      {open && <div onClick={handleClose} id="task-modal-layout"></div>}
    </>
  );
}
