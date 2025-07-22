"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import "moment/locale/fr";
import socket from "@/utils/socket";
import { updateTaskDeadline } from "@/api/task";
import { CircleX } from "lucide-react";
import { checkRole } from "@/utils/utils";

export default function TaskDeadline({ task, uid }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState("0%");
  const [deadline, setDeadline] = useState(task?.deadline?.split("T")[0] || "");
  const [hover, setHover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const project = task?.projectId;

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
      socket.emit("update task", project?._id);
    }
  }

  const removeDeadline = async () => {
    const response = await updateTaskDeadline(task?._id, project?._id, null);

    if (response?.success) {
      setDeadline("");
      socket.emit("update task", project?._id);
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
    moment().isAfter(moment(deadline)) && task?.status?.status !== "done";
  const isToday =
    moment().isSame(moment(deadline), "day") && task?.status?.status !== "done";

  const handleHover = useCallback(() => {
    const isAuthorized = checkRole(
      project,
      ["owner", "manager", "team", "customer"],
      uid
    );

    if (!isAuthorized) return;

    setHover(true);
  }, [project, uid]);

  const handleIsEditing = useCallback(() => {
    const isAuthorized = checkRole(
      project,
      ["owner", "manager", "team", "customer"],
      uid
    );

    if (!isAuthorized) return;

    setIsEditing((prev) => !prev);
  }, [project, uid]);

  return (
    <div
      className="hidden md:flex justify-center items-center py-1 px-1 lg:px-2 border-r border-text-light-color min-w-[80px] lg:min-w-[100px] max-w-[120px] w-full h-full gap-0.5 flex-shrink-0"
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="wrapper_TaskDeadline relative w-full bg-primary rounded-3xl py-1 px-0.5 text-center cursor-pointer text-xs lg:text-small overflow-hidden"
        onMouseEnter={handleHover}
        onClick={handleIsEditing}
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
              className="absolute opacity-0 w-0 h-0"
            />
          )}
          {deadline ? (
            <span className="relative z-1 text-white select-none">
              {displayDate()}
            </span>
          ) : (
            <span className="relative z-1 select-none">
              {hover || isEditing ? "Définir" : "-"}
            </span>
          )}
        </div>
      </div>
      {hover && deadline && (
        <CircleX
          size={12}
          onClick={removeDeadline}
          cursor={"pointer"}
          className="w-3 h-3 lg:w-4.5 lg:h-4.5 text-text-color-muted hover:text-danger-color"
        />
      )}
    </div>
  );
}
