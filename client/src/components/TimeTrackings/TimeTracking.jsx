"use client";
import styles from "@/styles/components/timeTrackings/time-tracking.module.css";
import { formatTime } from "@/utils/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/fr";
import socket from "@/utils/socket";
import { useDebouncedCallback } from "use-debounce";
import { MoreVerticalIcon } from "lucide-react";
import TimeTrackingMore from "./TimeTrackingMore";
import { useUserRole } from "@/app/hooks/useUserRole";
import { updateTaskText } from "@/api/task";
import { updateTimeTrackingText } from "@/api/timeTracking";

const initialState = {
  status: "pending",
  message: "",
  data: null,
  errors: null,
};

export default function TimeTracking({
  tracker,
  setSelectedTrackers,
  projects,
}) {
  const [inputValue, setInputValue] = useState(
    tracker?.taskId?.text || tracker?.taskText || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isMore, setIsMore] = useState(false);

  const project = projects?.find(
    (project) => project?._id === tracker?.projectId?._id
  );
  const canPut = useUserRole(project, ["owner", "manager", "team", "customer"]);

  const date = moment(tracker?.startTime).format("DD/MM/YYYY");

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

    if (tracker?.taskId?.text) {
      const taskId = tracker?.taskId?._id;
      const projectId = tracker?.projectId?._id;

      response = await updateTaskText(taskId, projectId, inputValue);

      if (response?.success) {
        socket.emit(
          "task text update",
          tracker?.projectId?._id,
          tracker?.taskId?._id,
          inputValue
        );
      }
    } else if (tracker?.taskText) {
      const projectId = tracker?.projectId?._id;

      response = await updateTimeTrackingText(
        tracker?._id,
        projectId,
        inputValue
      );
    }

    if (!response?.success) {
      setInputValue(tracker?.taskId?.text);
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

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {/* Element selection */}
      <div className={`${styles.selection} ${styles.row}`}>
        <input
          type="checkbox"
          name="tracker"
          id={`tracker-${tracker?._id}`}
          defaultValue={tracker?._id}
          onClick={handleSelectTracker}
        />
      </div>
      {/* Task text */}
      <div className={styles.text}>
        {isEditing ? (
          <input
            type="text"
            id="task"
            name="text"
            value={inputValue}
            onBlur={handleIsEditing}
            onChange={handleChange}
            autoFocus
          />
        ) : (
          <span onClick={handleIsEditing}>{inputValue}</span>
        )}
      </div>
      {/* user */}
      <div className={`${styles.user} ${styles.row}`}>
        <span>
          {tracker?.userId?.picture && (
            <Image
              src={tracker?.userId?.picture}
              alt={tracker?.userId?.firstName}
              style={{
                borderRadius: "50%",
              }}
              width={22}
              height={22}
            />
          )}
          {tracker?.userId?.firstName + " " + tracker?.userId?.lastName}
        </span>
      </div>
      <div className={`${styles.date} ${styles.row}`}>
        <span>{date}</span>
      </div>
      {/* Duration */}
      <div className={`${styles.duration} ${styles.row}`}>
        <span>{formatTime(Math.floor(tracker?.duration / 1000))}</span>
      </div>
      {isHover && (
        <div className={`${styles.more} ${styles.row}`}>
          <MoreVerticalIcon
            size={18}
            cursor={"pointer"}
            onClick={() => setIsMore(true)}
          />
          {isMore && (
            <TimeTrackingMore
              tracker={tracker}
              setIsEditing={setIsEditing}
              setIsMore={setIsMore}
              setIsHover={setIsHover}
            />
          )}
        </div>
      )}
    </div>
  );
}
