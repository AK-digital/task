"use client";
import styles from "@/styles/components/task/task-more.module.css";
import { useRef, useState, useEffect, useCallback } from "react";
import Messages from "../messages/Messages";
import Image from "next/image";
import moment from "moment";
import TaskDescription from "./TaskDescription";
import { usePathname } from "next/navigation";
moment.locale("fr");

export default function TaskMore({ task, archive = false, uid, mutateTasks }) {
  const [open, setOpen] = useState(true);
  const containerRef = useRef(null);
  const resizerRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);
  const pathname = usePathname();
  const project = task?.projectId;

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
  const updateResizerPosition = () => {
    if (containerRef.current && resizerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      resizerRef.current.style.left = `${containerRect.left}px`;
    }
    requestAnimationFrame(updateResizerPosition); // loop
  };

  updateResizerPosition();

  return () => cancelAnimationFrame(updateResizerPosition);
}, []);

  const handleClose = () => {
    const container = containerRef.current;
    if (!container) return;

    container.classList.add(styles["container-close"]);

    const handleAnimationEnd = async () => {
      container.removeEventListener("animationend", handleAnimationEnd);
      let path = "";

      if (pathname?.includes("/projects")) {
        path = archive
          ? `/projects/${project?._id}/archive`
          : `/projects/${project?._id}`;
      }

      if (pathname?.includes("/tasks")) {
        path = `/tasks`;
      }
      window.history.pushState({}, "", path);
      setOpen(false);
    };

    container.addEventListener("animationend", handleAnimationEnd, {
      once: true,
    });
  };

  return (
    <>
      <div
        ref={resizerRef}
        className={styles.resizer}
        onMouseDown={startResizing}
      ></div>
      <div className={styles.container} ref={containerRef} id="task-more">
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
          <Messages task={task} project={project} mutateTasks={mutateTasks} />
        </div>
      </div>
      {open && <div onClick={handleClose} className="task-modal-layout"></div>}
    </>
  );
}
