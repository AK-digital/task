"use client";
import styles from "@/styles/components/tasks/task-more.module.css";
import { useRef, useState, useEffect, useCallback } from "react";
import Messages from "../messages/Messages";
import Image from "next/image";
import moment from "moment";
import { MessagesSquareIcon, PanelTop } from "lucide-react";
import Tiptap from "../RichTextEditor/Tiptap";
import TaskDescription from "./TaskDescription";
moment.locale("fr");

export default function TaskMore({ task, project, archive, uid }) {
  const [open, setOpen] = useState(true);
  const containerRef = useRef(null);
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
      setOpen(false);
    };

    container.addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
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
              className="rounded-full max-h-[20px]"
            />{" "}
            {task?.author
              ? task?.author?.firstName + " " + task?.author?.lastName
              : "Ancien utilisateur"}{" "}
            le {moment(task?.createdAt).format("DD/MM/YYYY")}
          </span>
        </div>
        <div className={styles.wrapper}>
          <TaskDescription project={project} task={task} uid={uid} />
        </div>
        {/* Conversation */}
        <div className={styles.wrapper}>
          <Messages task={task} project={project} />
        </div>
      </div>
      {open && <div onClick={handleClose} className="task-modal-layout"></div>}
    </>
  );
}
