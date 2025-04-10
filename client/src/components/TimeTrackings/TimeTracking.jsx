"use client";
import styles from "@/styles/components/timeTrackings/time-tracking.module.css";
import { formatTime } from "@/utils/utils";
import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import moment from "moment";
import "moment/locale/fr";
import { updateTaskText } from "@/actions/task";
import socket from "@/utils/socket";
import { useDebouncedCallback } from "use-debounce";
import { MoreVerticalIcon } from "lucide-react";
import TimeTrackingMore from "./TimeTrackingMore";

const initialState = {
  status: "pending",
  message: "",
  data: null,
  errors: null,
};

export default function TimeTracking({ tracker, setSelectedTrackers }) {
  const [inputValue, setInputValue] = useState(tracker?.taskId?.text || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isMore, setIsMore] = useState(false);
  const formRef = useRef(null);
  const updateTaskTextWithIds = updateTaskText.bind(
    null,
    tracker?.taskId?._id,
    tracker?.taskId?.projectId
  );
  const [state, formAction, pending] = useActionState(
    updateTaskTextWithIds,
    initialState
  );

  const date = moment(tracker?.startTime).format("DD/MM/YYYY");

  useEffect(() => {
    if (state?.status === "success") {
      socket.emit(
        "task text update",
        tracker?.projectId?._id,
        tracker?.taskId?._id,
        inputValue
      );
    } else {
      setInputValue(tracker?.taskId?.text);
    }
  }, [state]);

  const handleDebouncedChange = useDebouncedCallback((e) => {
    formRef?.current?.requestSubmit();
  }, 500);

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
    if (!tracker?.taskId?.text) return;

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
          <form action={formAction} ref={formRef}>
            <input
              type="text"
              id="task"
              name="text"
              value={inputValue}
              onBlur={handleIsEditing}
              onChange={(e) => {
                setInputValue(e.target.value);
                handleDebouncedChange(e);
              }}
              autoFocus
            />
          </form>
        ) : (
          <span onClick={handleIsEditing}>
            {tracker?.taskId?.text || tracker?.taskText}
          </span>
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
