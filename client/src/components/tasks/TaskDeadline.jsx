"use client";
import styles from "@/styles/components/tasks/task-deadline.module.css";
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import "moment/locale/fr";
import socket from "@/utils/socket";
import { updateTaskDeadline } from "@/api/task";
import { CircleX } from "lucide-react";

export default function TaskDeadline({ task, project }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState("0%");
  const [deadline, setDeadline] = useState(task?.deadline?.split("T")[0] || "");
  const [hover, setHover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Update deadline when task is updated (from another user)
    setDeadline(task?.deadline?.split("T")[0] || "");
  }, [task.deadline]);

  const calculateProgress = () => {
    if (!deadline) return "0%";

    // Get current date and deadline
    const now = moment();
    const deadlineDate = moment(deadline);

    // If deadline is today or past, return 100%
    if (now.isSame(deadlineDate, "day") || now.isAfter(deadlineDate, "day")) {
      return "100%";
    }

    // Calculate days until deadline
    const daysUntilDeadline = deadlineDate.diff(now, "days");

    const maxDays = 30; // Maximum number of days to display progress

    if (daysUntilDeadline === 0) {
      // If deadline is tomorrow (0 full days remaining)
      return "90%";
    } else {
      // Calculate progress percentage
      const progressPercentage =
        100 - (Math.min(daysUntilDeadline, maxDays) / maxDays) * 80 - 10;

      return `${progressPercentage.toFixed(0)}%`;
    }
  };

  useEffect(() => {
    setProgress(calculateProgress());
  }, [deadline]);

  async function handleUpdateDate(e) {
    const date = e.target.value;

    const response = await updateTaskDeadline(task?._id, project?._id, date);

    if (response?.success) {
      setDeadline(date);
      socket.emit("update task", task?.projectId);
    }
  }

  const removeDeadline = async () => {
    const response = await updateTaskDeadline(task?._id, project?._id, null);

    if (response?.success) {
      setDeadline("");
      socket.emit("update task", task?.projectId);
    }
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current.showPicker(); // show date picker
    }
  }, [isEditing]);

  const displayDate = () => {
    const actualDate = moment().format("DD MMM");
    const formattedDeadline = moment(deadline).format("DD MMM");

    if (formattedDeadline) {
      return actualDate + " - " + formattedDeadline;
    } else {
      return "-";
    }
  };

  const pastDeadline =
    moment().isAfter(moment(deadline)) && task?.status !== "Terminée";
  const isToday =
    moment().isSame(moment(deadline), "day") && task?.status !== "Terminée";

  return (
    <div className={styles.container} onMouseLeave={() => setHover(false)}>
      <div
        className={styles.wrapper}
        onMouseEnter={() => setHover(true)}
        onClick={() => setIsEditing(true)}
        style={{ "--progress": `${deadline ? progress : "0%"}` }}
        data-past-deadline={pastDeadline}
        data-past-today={isToday}
      >
        <div>
          {isEditing && (
            <input
              type="date"
              name="deadline"
              id="deadline"
              onBlur={() => setIsEditing(false)}
              autoFocus
              value={deadline}
              onChange={handleUpdateDate}
              ref={inputRef}
            />
          )}
          {deadline ? (
            <span>{displayDate()}</span>
          ) : (
            <span>{hover || isEditing ? "Définir une date" : "-"}</span>
          )}
        </div>
      </div>
      {hover && deadline && (
        <CircleX size={12} onClick={removeDeadline} cursor={"pointer"} />
      )}
    </div>
  );
}
