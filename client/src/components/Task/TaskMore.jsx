"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Messages from "../messages/Messages";
import Image from "next/image";
import moment from "moment";
import TaskDescription from "./TaskDescription";
import { usePathname } from "next/navigation";
import Portal from "../Portal/Portal";
import { updateTaskText } from "@/api/task";
import socket from "@/utils/socket";
import { Edit3 } from "lucide-react";
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
  const [showPreviewImageMessage, setShowPreviewImageMessage] = useState(false);
  const [edit, setEdit] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task?.text || "");
  const titleInputRef = useRef(null);

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

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setTitleValue(task?.text || "");
  };

  const handleSaveTitle = async () => {
    if (titleValue.trim() === "" || titleValue === task?.text) {
      setIsEditingTitle(false);
      setTitleValue(task?.text || "");
      return;
    }

    try {
      const response = await updateTaskText(task?._id, project?._id, titleValue.trim());

      if (response?.success) {
        await mutateTasks();
        socket.emit("update task", project?._id);
        setIsEditingTitle(false);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du titre:", error);
      setTitleValue(task?.text || "");
      setIsEditingTitle(false);
    }
  };

  const handleCancelTitle = () => {
    setIsEditingTitle(false);
    setTitleValue(task?.text || "");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelTitle();
    }
  };

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
        className={`container_TaskMore flex flex-col gap-3 fixed z-[8000] top-0 right-0 bottom-0 bg-[url('/backgrounds/background.jpg')] bg-no-repeat bg-[20%_50%] bg-cover h-screen shadow-[-4px_10px_10px_0px_rgba(0,0,0,0.15)] p-8 cursor-default overflow-y-auto min-w-[520px] max-w-[calc(100vw-80px)] ${
          showPreviewImageMessage
            ? "w-screen"
            : "w-[clamp(520px,45%,calc(100vw-80px))]"
        }`}
        ref={containerRef}
        style={{ resize: 'horizontal' }}
      >
        {/* Description */}
        <div className="flex flex-col gap-2 mb-6">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveTitle}
                className="text-large font-medium bg-third border border-gray-300 rounded px-2 py-1 flex-1 focus:outline-none focus:border-accent-color"
                placeholder="Titre de la tâche"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleEditTitle}>
              <p className="text-large font-medium">{task?.text}</p>
              <Edit3
                size={16}
                className="text-gray-400 group-hover:text-accent-color transition-colors flex-shrink-0"
              />
            </div>
          )}
          <span className="flex items-center gap-1 text-small text-text-color-muted select-none">
            Par{" "}
            <Image
              src={task?.author?.picture || "/default/default-pfp.webp"}
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
        <div className="flex flex-col gap-3">
          <TaskDescription
            project={project}
            task={task}
            uid={uid}
            showPreviewImageMessage={showPreviewImageMessage}
            setShowPreviewImageMessage={setShowPreviewImageMessage}
            edit={edit}
            setEdit={setEdit}
          />
        </div>
        
        {/* Conversation */}
        <div className="flex flex-col gap-3">
          <Messages
            task={task}
            project={project}
            mutateTasks={mutateTasks}
            showPreviewImageMessage={showPreviewImageMessage}
            setShowPreviewImageMessage={setShowPreviewImageMessage}
            edit={edit}
            setEdit={setEdit}
          />
        </div>
      </div>
      {open && <div onClick={handleClose} className="task-modal-layout"></div>}
    </Portal>
  );
}
