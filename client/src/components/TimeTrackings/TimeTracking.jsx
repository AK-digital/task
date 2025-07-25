"use client";
import { formatTime } from "@/utils/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/fr";
import socket from "@/utils/socket";
import { useDebouncedCallback } from "use-debounce";
import { MoreVerticalIcon, BadgeEuro } from "lucide-react";
import TimeTrackingMore from "./TimeTrackingMore";
import { useUserRole } from "../../../hooks/useUserRole";
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
  const [isHover, setIsHover] = useState(false);
  const [isMore, setIsMore] = useState(false);
  const [isBillable, setIsBillable] = useState(tracker?.billable ?? true);
  const [isSpinning, setIsSpinning] = useState(false);

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

  return (
    <div
      className="flex items-center bg-secondary border-b border-text-light-color text-normal h-[42px] last:border-b-0 last:rounded-bl-2xl"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Element selection */}
      <div className="flex justify-center items-center min-w-10 max-w-10 gap-1 w-full h-full cursor-default">
        <input
          type="checkbox"
          name="tracker"
          id={`tracker-${tracker?._id}`}
          defaultValue={tracker?._id}
          onClick={handleSelectTracker}
          className="w-3.5 cursor-pointer"
        />
      </div>
      {/* Task text */}
      <div className="w-full min-w-[200px] max-w-[700px] cursor-text">
        {isEditing ? (
          <input
            type="text"
            id="task"
            name="text"
            value={inputValue}
            onBlur={handleIsEditing}
            onChange={handleChange}
            autoFocus
            className="relative -left-1.5 border-none p-1.5 bg-third rounded-sm text-[14.8px] text-text-medium-color animate-[backgroundAppear_150ms_linear]"
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
      <div className="flex justify-center items-center gap-1 w-full h-full cursor-default min-w-[150px] max-w-[150px] border-l border-text-light-color px-1">
        <Image
          src={project?.logo || "/default/default-project-logo.webp"}
          alt={project?.name}
          width={22}
          height={22}
          className="rounded-full w-[22px] h-[22px] max-w-[22px] max-h-[22px] select-none"
        />
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
          {project?.name}
        </span>
      </div>
      {/* user */}
      <div className="flex justify-center items-center gap-1 w-full h-full cursor-default min-w-[150px] max-w-[150px] border-l border-r border-text-light-color ">
        {user?.picture ? (
          <Image
            src={user?.picture}
            alt={user?.firstName}
            width={22}
            height={22}
            className="rounded-full w-[22px] h-[22px] max-w-[22px] max-h-[22px]"
          />
        ) : (
          <NoPicture user={user} width={22} height={22} />
        )}
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
          {user?.firstName + " " + user?.lastName}
        </span>
      </div>
      <div className="flex justify-center items-center gap-1 w-full h-full cursor-default min-w-[120px] max-w-[120px] border-r border-text-light-color select-none">
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
          {date}
        </span>
      </div>
      {/* Duration */}
      <div className="flex justify-center items-center gap-1 w-full h-full cursor-default max-w-[100px] min-w-[100px] border-r border-text-light-color select-none">
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
          {formatTime(Math.floor(tracker?.duration / 1000))}
        </span>
      </div>
      {/* Billable */}
      <div
        className={`relative flex justify-center items-center gap-1 w-full h-full max-w-[120px] min-w-[120px] border-r border-text-light-color text-text-color-muted ${
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
      {isHover && (
        <div className="relative flex items-center justify-center gap-1 w-full h-full cursor-default max-w-5 min-w-5 text-text-color-muted">
          <MoreVerticalIcon
            size={18}
            cursor={"pointer"}
            onClick={() => setIsMore(true)}
            className="hover:text-text-dark-color"
          />
          {isMore && (
            <TimeTrackingMore
              tracker={tracker}
              setIsEditing={setIsEditing}
              setIsMore={setIsMore}
              setIsHover={setIsHover}
              mutateTimeTrackings={mutateTimeTrackings}
            />
          )}
        </div>
      )}
    </div>
  );
}
