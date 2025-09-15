"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import "moment/locale/fr";
import socket from "@/utils/socket";
import { updateTaskDeadline } from "@/api/task";
import { CircleX, Calendar } from "lucide-react";
import { checkRole } from "@/utils/utils";
import DatePicker from "./DatePicker";

export default function TaskDeadline({ task, uid }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState("0%");
  const [deadline, setDeadline] = useState(task?.deadline?.split("T")[0] || "");
  const [hover, setHover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  async function handleUpdateDate(date) {
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
      setShowDatePicker(true);
    }
  }, [isEditing]);

  const displayDate = () => {
    const actualDate = moment().format("DD MMM");
    const deadlineDate = moment(deadline);
    const currentYear = moment().year();
    const deadlineYear = deadlineDate.year();
    
    // Si la deadline est dans une autre année, inclure l'année
    const formattedDeadline = deadlineYear !== currentYear 
      ? deadlineDate.format("DD MMM YYYY")
      : deadlineDate.format("DD MMM");

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

    setShowDatePicker(true);
    setIsEditing(true);
  }, [project, uid]);

  const handleCloseDatePicker = useCallback(() => {
    setShowDatePicker(false);
    setIsEditing(false);
  }, []);

  return (
    <div
      className="task-col-deadline task-content-col gap-0.5 relative flex items-center"
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="wrapper_TaskDeadline relative bg-primary rounded-[5px] py-1 px-1 text-center cursor-pointer text-xs lg:text-small overflow-visible flex items-center justify-center gap-1 flex-1 min-w-0"
        onMouseEnter={handleHover}
        onClick={handleIsEditing}
        style={{ "--progress": `${deadline ? progress : "0%"}` }}
        data-past-deadline={pastDeadline}
        data-past-today={isToday}
      >
        {deadline ? (
          <span className="relative z-10 text-white text-shadow-xs text-xs select-none font-medium whitespace-nowrap overflow-hidden text-ellipsis">
            {displayDate()}
          </span>
        ) : (
          <>
            {hover || isEditing ? (
              <>
                <Calendar size={12} className="relative z-10 text-gray-600" />
                <span className="relative z-10 select-none text-gray-600 text-xs">
                  Définir
                </span>
              </>
            ) : (
              <span className="relative z-10 select-none text-gray-500">-</span>
            )}
          </>
        )}
      </div>
      
      {hover && deadline && (
        <CircleX
          size={12}
          onClick={removeDeadline}
          cursor={"pointer"}
          className="w-3 h-3 lg:w-4.5 lg:h-4.5 text-text-color-muted hover:text-danger-color flex-shrink-0 ml-1"
        />
      )}
      
      <DatePicker
        value={deadline}
        onChange={handleUpdateDate}
        onClose={handleCloseDatePicker}
        isOpen={showDatePicker}
      />
    </div>
  );
}
