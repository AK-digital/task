"use client";
import { taskEndTimer, taskStartTimer } from "@/api/task";
import styles from "@/styles/components/tasks/task-timer.module.css";
import { isNotEmpty } from "@/utils/utils";
import { faPauseCircle, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function TaskTimer({ task }) {
  const [timer, setTimer] = useState(
    Math.floor((task?.timeTracking?.totalTime || 0) / 1000)
  );
  const [more, setMore] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const sessions = task?.timeTracking?.sessions;

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  async function handlePauseTimer() {
    setIsRunning(false);
    await taskEndTimer(task?._id, task?.projectId);
  }

  async function handlePlayTimer() {
    setIsRunning(true);
    await taskStartTimer(task?._id, task?.projectId);
  }

  const formatTime = (totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div
      className={styles.container}
      data-running={isRunning}
      onMouseEnter={(e) => setMore(true)}
      onMouseLeave={(e) => setMore(false)}
    >
      <span>
        {isRunning ? (
          <FontAwesomeIcon
            icon={faPauseCircle}
            data-running={isRunning}
            onClick={handlePauseTimer}
          />
        ) : (
          <FontAwesomeIcon
            icon={faPlayCircle}
            data-running={isRunning}
            onClick={handlePlayTimer}
          />
        )}
        {formatTime(timer)}
      </span>
      {isNotEmpty(sessions) && more && (
        <div className={styles.more} id="modal">
          <ul>
            {Object.values(
              sessions.reduce((acc, session) => {
                const userId = session?.userId?._id; // Assure-toi que l'ID est bien accessible
                if (!userId) return acc;

                if (!acc[userId]) {
                  // Première fois qu'on voit cet utilisateur
                  acc[userId] = {
                    user: session.userId, // Stocke l'utilisateur
                    totalDuration: 0, // Initialise la durée totale
                  };
                }

                acc[userId].totalDuration += session.duration || 0;
                return acc;
              }, {})
            ).map(({ user, totalDuration }) => (
              <li key={user._id}>
                <Image
                  src={user.picture || "/default-pfp.webp"}
                  width={25}
                  height={25}
                  style={{ borderRadius: "50%" }}
                  alt={`Photo de profil de ${user?.firstName}`}
                />
                <span>{formatTime(Math.floor(totalDuration / 1000))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
