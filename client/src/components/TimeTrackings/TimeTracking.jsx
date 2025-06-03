"use client";
import styles from "@/styles/components/timeTrackings/time-tracking.module.css";
import { formatTime } from "@/utils/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/fr";
import socket from "@/utils/socket";
import { useDebouncedCallback } from "use-debounce";
import { MoreVerticalIcon, BadgeEuro } from "lucide-react";
import TimeTrackingMore from "./TimeTrackingMore";
import { useUserRole } from "@/app/hooks/useUserRole";
import { updateTaskText } from "@/api/task";
import {
  updateTimeTrackingText,
  updateTimeTrackingBillable,
} from "@/api/timeTracking";
import NoPicture from "../User/NoPicture";
import { extractId } from "@/utils/extractId";
import { useTranslation } from "react-i18next";

export default function TimeTracking({
  tracker,
  setSelectedTrackers,
  mutateTimeTrackings,
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(
    tracker?.task?.[0]?.text || tracker?.taskText || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isMore, setIsMore] = useState(false);
  const [isBillable, setIsBillable] = useState(tracker?.billable ?? true);
  const [isSpinning, setIsSpinning] = useState(false);

  const project = tracker?.project;
  const user = tracker?.user;
  const canPut = useUserRole(project, ["owner", "manager"]);

  const date = moment(tracker?.startTime).format("DD/MM/YYYY");

  useEffect(() => {
    const handleTaskUpdated = (projectId) => {
      // Seulement revalider si c'est le bon projet
      const currentProjectId = extractId(tracker?.projectId);
      if (projectId === currentProjectId) {
        mutateTimeTrackings(undefined, {
          revalidate: true,
          populateCache: false,
        });
      }
    };

    const handleTimeTrackingUpdated = (updatedTrackerId) => {
      // Seulement revalider si c'est ce tracker ou si on ne spécifie pas d'ID
      if (!updatedTrackerId || updatedTrackerId === tracker._id) {
        mutateTimeTrackings(undefined, {
          revalidate: true,
          populateCache: false,
        });
      }
    };

    socket.on("task updated", handleTaskUpdated);
    socket.on("time tracking updated", handleTimeTrackingUpdated);

    return () => {
      socket.off("task updated", handleTaskUpdated);
      socket.off("time tracking updated", handleTimeTrackingUpdated);
    };
  }, [mutateTimeTrackings, tracker._id, tracker?.projectId]);

  useEffect(() => {
    setIsBillable(tracker?.billable ?? true);
    setInputValue(tracker?.task?.[0]?.text || tracker?.taskText || "");
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
          mutateTimeTrackings(undefined, {
            revalidate: true,
            populateCache: false,
          });
        }
      } else if (tracker?.taskText !== undefined) {
        const projectId = extractId(tracker?.projectId);

        response = await updateTimeTrackingText(tracker?._id, projectId, value);

        if (response?.success) {
          socket.emit("time tracking updated", tracker?._id);
          mutateTimeTrackings(undefined, {
            revalidate: true,
            populateCache: false,
          });
        }
      }

      if (!response?.success) {
        throw new Error(response?.message || t("time_tracking.update_failed"));
      }
    } catch (error) {
      setInputValue(tracker?.task?.[0]?.text || tracker?.taskText || "");
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
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

    mutateTimeTrackings(
      (currentData) => {
        if (!currentData?.data) return currentData;
        return {
          ...currentData,
          data: currentData.data.map((t) =>
            t._id === tracker._id ? { ...t, billable: newBillableState } : t
          ),
        };
      },
      false // Ne pas revalider immédiatement
    );

    try {
      const projectId = extractId(tracker?.projectId);

      const response = await updateTimeTrackingBillable(
        tracker?._id,
        projectId,
        newBillableState
      );

      if (response?.success) {
        socket.emit("time tracking updated", tracker?._id);

        setTimeout(() => {
          setIsSpinning(false);
          mutateTimeTrackings(undefined, {
            revalidate: true,
            populateCache: false,
          });
        }, 300);
      } else {
        throw new Error(response?.message || t("time_tracking.update_failed"));
      }
    } catch (error) {
      setIsBillable(!newBillableState);
      mutateTimeTrackings(undefined, {
        revalidate: true,
        populateCache: false,
      });
      setIsSpinning(false);
    }
  };

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
      <div className={`${styles.project} ${styles.row}`}>
        <Image
          src={project?.logo || "/default-project-logo.webp"}
          alt={project?.name}
          style={{
            borderRadius: "50%",
          }}
          width={22}
          height={22}
        />
        <span>{project?.name}</span>
      </div>
      {/* user */}
      <div className={`${styles.user} ${styles.row}`}>
        {user?.picture ? (
          <Image
            src={user?.picture}
            alt={user?.firstName}
            style={{
              borderRadius: "50%",
            }}
            width={22}
            height={22}
          />
        ) : (
          <NoPicture user={user} width={22} height={22} />
        )}
        <span>{user?.firstName + " " + user?.lastName}</span>
      </div>
      <div className={`${styles.date} ${styles.row}`}>
        <span>{date}</span>
      </div>
      {/* Duration */}
      <div className={`${styles.duration} ${styles.row}`}>
        <span>{formatTime(Math.floor(tracker?.duration / 1000))}</span>
      </div>
      {/* Billable */}
      <div
        className={`${styles.billable} ${styles.row}`}
        onClick={handleBillableToggle}
        data-disabled={!canPut}
      >
        <BadgeEuro
          size={18}
          key={isSpinning ? "spinning" : "not-spinning"}
          className={`${isSpinning ? styles.spin : ""}`}
          cursor={canPut ? "pointer" : "default"}
        />
        {!isBillable && <div className={styles.slash}></div>}
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
              mutateTimeTrackings={mutateTimeTrackings}
            />
          )}
        </div>
      )}
    </div>
  );
}
