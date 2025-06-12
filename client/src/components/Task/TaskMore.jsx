"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Messages from "../messages/Messages";
import Image from "next/image";
import moment from "moment";
import TaskDescription from "./TaskDescription";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import Portal from "../Portal/Portal";
moment.locale("fr");

export default function TaskMore({ task, archive = false, uid, mutateTasks }) {
  const { t } = useTranslation();
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

    container.classList.add("container-close_TaskMore");

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
    <Portal>
      <div
        ref={resizerRef}
        className="w-1 h-screen fixed top-0 left-0 cursor-col-resize bg-transparent z-[2002] hover:bg-accent-color active:bg-accent-color"
        onMouseDown={startResizing}
      ></div>
      <div
        className="container_TaskMore flex flex-col gap-3 fixed z-[8000] top-0 right-0 bottom-0 bg-[url('/backgrounds/background.jpg')] bg-no-repeat bg-[20%_50%] bg-cover w-[clamp(520px,45%,calc(100vw-80px))] h-screen shadow-[-4px_10px_10px_0px_rgba(0,0,0,0.15)] p-8 cursor-default overflow-y-auto min-w-[520px] resize-x"
        ref={containerRef}
      >
        {/* Description */}
        <div className="flex flex-col gap-2 mb-6">
          <p className="text-large font-medium">{task?.text}</p>
          <span className="flex items-center gap-1 text-small text-text-color-muted select-none">
            {t("tasks.by")}{" "}
            <Image
              src={task?.author?.picture || "/default-pfp.webp"}
              width={20}
              height={20}
              alt={`${t("general.profile_picture_alt")} ${
                task?.author?.firstName
              }`}
              style={{
                borderRadius: "50%",
              }}
              className="rounded-full max-h-[20px]"
            />{" "}
            {task?.author
              ? task?.author?.firstName + " " + task?.author?.lastName
              : t("tasks.former_user")}{" "}
            {t("tasks.on")} {moment(task?.createdAt).format("DD/MM/YYYY")}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <TaskDescription project={project} task={task} uid={uid} />
        </div>
        {/* Conversation */}
        <div className="flex flex-col gap-3">
          <Messages task={task} project={project} mutateTasks={mutateTasks} />
        </div>
      </div>
      {open && <div onClick={handleClose} className="task-modal-layout"></div>}
    </Portal>
  );
}
