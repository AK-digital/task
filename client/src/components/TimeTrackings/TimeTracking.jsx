"use client";
import { formatTime } from "@/utils/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/fr";
import socket from "@/utils/socket";
import { useDebouncedCallback } from "use-debounce";
import { BadgeEuro } from "lucide-react";
import TimeTrackingContextMenu from "./TimeTrackingContextMenu";
import { useUserRole } from "@/hooks/api/useUserRole";
import { updateTaskText } from "@/api/task";
import {
  updateTimeTrackingText,
  updateTimeTrackingBillable,
} from "@/api/timeTracking";
import NoPicture from "../User/NoPicture";
import { extractId } from "@/utils/extractId";

export default function TimeTracking({
  tracker,
  setSelectedTrackers,
  mutateTimeTrackings,
}) {
  const [inputValue, setInputValue] = useState(
    tracker?.taskId?.text || tracker?.taskText || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isBillable, setIsBillable] = useState(tracker?.billable ?? true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const project = tracker?.projectId;
  const user = tracker?.userId;
  const canPut = useUserRole(project, ["owner", "manager"]);

  const date = moment(tracker?.startTime).format("DD/MM/YYYY");

  useEffect(() => {
    setIsBillable(tracker?.billable ?? true);
    setInputValue(tracker?.taskId?.text || tracker?.taskText || "");
  }, [tracker]);

  function handleChange(e) {
    const value = e.target.value;
    setInputValue(value);
    handleDebouncedChange(value);
  }

  const handleDebouncedChange = useDebouncedCallback((value) => {
    handleUpdateTaskText(value);
  }, 600);

  async function handleUpdateTaskText(value) {
    let response;

    // Ne pas faire de mise à jour si la valeur n'a pas changé
    if (value === (tracker?.task?.[0]?.text || tracker?.taskText)) {
      return;
    }

    try {
      if (tracker?.taskId?.text) {
        const taskId = extractId(tracker?.taskId);
        const projectId = extractId(tracker?.projectId);

        response = await updateTaskText(taskId, projectId, value);

        if (response?.success) {
          socket.emit("update task", projectId, taskId, value);
          mutateTimeTrackings();
        }
      } else if (tracker?.taskText !== undefined) {
        const projectId = extractId(tracker?.projectId);

        response = await updateTimeTrackingText(tracker?._id, projectId, value);

        if (response?.success) {
          socket.emit(" update time tracking", tracker?._id);
          mutateTimeTrackings();
        }
      }

      if (!response?.success) {
        throw new Error(response?.message || "Échec de la mise à jour");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setInputValue(tracker?.taskId?.text || tracker?.taskText || "");
      mutateTimeTrackings();
    }
  }

  const handleSelectTracker = (e) => {
    const checked = e.target.checked;
    const value = e.target.value;
    if (checked) {
      setSelectedTrackers((prev) => [...prev, value]);
    } else {
      setSelectedTrackers((prev) => prev.filter((id) => id !== value));
    }
  };

  function handleIsEditing(e) {
    if (!canPut) return;

    setIsEditing((prev) => !prev);
  }

  const handleBillableToggle = async () => {
    if (!canPut || isSpinning) return;

    setIsSpinning(true);
    const newBillableState = !isBillable;

    setIsBillable(newBillableState);

    try {
      const projectId = extractId(tracker?.projectId);

      const response = await updateTimeTrackingBillable(
        tracker?._id,
        projectId,
        newBillableState
      );

      if (response?.success) {
        socket.emit("update time tracking", tracker?._id);

        setTimeout(() => {
          setIsSpinning(false);
          mutateTimeTrackings();
        }, 300);
      } else {
        throw new Error(response?.message || "Échec de la mise à jour");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut facturable:",
        error
      );
      setIsBillable(!newBillableState);
      mutateTimeTrackings();
      setIsSpinning(false);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  return (
    <>
    <div
      className="flex items-center bg-secondary border-b border-text-light-color text-normal h-[42px] w-full"
      data-tracker-id={tracker._id}
      onContextMenu={handleContextMenu}
    >
      {/* Element selection */}
      <div className="flex justify-center items-center w-10 flex-shrink-0 gap-1 h-full cursor-default">
        <input
          type="checkbox"
          name="tracker"
          id={`tracker-${tracker?._id}`}
          defaultValue={tracker?._id}
          onClick={handleSelectTracker}
        />
      </div>
      {/* Task text */}
      <div className="flex-1 min-w-0 cursor-text px-2">
        {isEditing ? (
          <input
            type="text"
            id="task"
            name="text"
            value={inputValue}
            onBlur={handleIsEditing}
            onChange={handleChange}
            autoFocus
            className="w-full border-none p-1.5 bg-third rounded-sm text-[14.8px] text-text-medium-color animate-[backgroundAppear_150ms_linear]"
          />
        ) : (
          <span
            onClick={handleIsEditing}
            className="block overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {inputValue}
          </span>
        )}
      </div>
      {/* Project */}
      <div className="flex items-center gap-1 w-40 flex-shrink-0 h-full cursor-default border-l border-text-light-color px-2">
        <Image
          src={project?.logo || "/default/default-project-logo.webp"}
          alt={project?.name}
          width={22}
          height={22}
          className="rounded-full w-[22px] h-[22px] max-w-[22px] max-h-[22px] select-none flex-shrink-0"
        />
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
          {project?.name}
        </span>
      </div>
      {/* User */}
      <div className="flex items-center gap-1 w-40 flex-shrink-0 h-full cursor-default border-l border-r border-text-light-color px-2">
        {user?.picture ? (
          <Image
            src={user?.picture}
            alt={user?.firstName}
            width={22}
            height={22}
            className="rounded-full w-[22px] h-[22px] max-w-[22px] max-h-[22px] flex-shrink-0"
          />
        ) : (
          <NoPicture user={user} width={22} height={22} />
        )}
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
          {user?.firstName + " " + user?.lastName}
        </span>
      </div>
      {/* Date */}
      <div className="flex justify-center items-center gap-1 w-32 flex-shrink-0 h-full cursor-default border-r border-text-light-color select-none">
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
          {date}
        </span>
      </div>
      {/* Duration */}
      <div className="flex justify-center items-center gap-1 w-24 flex-shrink-0 h-full cursor-default border-r border-text-light-color select-none">
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
          {formatTime(Math.floor(tracker?.duration / 1000))}
        </span>
      </div>
      {/* Billable */}
      <div
        className={`relative flex justify-center items-center gap-1 w-24 flex-shrink-0 h-full border-r border-text-light-color text-text-color-muted ${
          !canPut
            ? "cursor-default"
            : "cursor-pointer hover:text-text-dark-color"
        }`}
        onClick={handleBillableToggle}
        data-disabled={!canPut}
      >
        <BadgeEuro
          size={18}
          key={isSpinning ? "spinning" : "not-spinning"}
          cursor={canPut ? "pointer" : "default"}
          className={`${
            isSpinning
              ? "transform-3d backface-visible animate-[spinY_0.5s_ease-in-out]"
              : ""
          }`}
        />
        {!isBillable && (
          <div className="absolute w-5 h-0.5 bg-current top-1/2 left-[42%] origin-center -translate-y-1/2 -rotate-45 pointer-events-none"></div>
        )}
      </div>
    </div>

    <TimeTrackingContextMenu
      isOpen={contextMenuOpen}
      setIsOpen={setContextMenuOpen}
      position={contextMenuPosition}
      tracker={tracker}
      setIsEditing={setIsEditing}
      mutateTimeTrackings={mutateTimeTrackings}
    />
    </>
  );
}
