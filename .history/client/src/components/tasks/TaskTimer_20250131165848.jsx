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
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(
    Math.floor((task?.timeTracking?.totalTime || 0) / 1000)
  );

  useEffect(() => {
    let intervalId;
    if (isRunning && startTime) {
      intervalId = setInterval(() => {
        const currentTime = Date.now();
        const newElapsedTime = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(newElapsedTime);
      }, 1000);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, startTime]);

  async function handlePlayTimer() {
    setStartTime(Date.now());
    setIsRunning(true);
    await taskStartTimer(task?._id, task?.projectId);
  }

  async function handlePauseTimer() {
    setIsRunning(false);
    await taskEndTimer(task?._id, task?.projectId);
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

  // Fonction pour transformer les sessions en un tableau structuré
  const getSessionDetails = (sessions) => {
    return Object.values(
      sessions.reduce((acc, session) => {
        const userId = session?.userId?._id;
        if (!userId) return acc;

        if (!acc[userId]) {
          acc[userId] = {
            user: session.userId,
            totalDuration: 0,
          };
        }

        acc[userId].totalDuration += session.duration || 0;
        return acc;
      }, {})
    );
  };

  const sessionDetails = isNotEmpty(sessions)
    ? getSessionDetails(sessions)
    : [];

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
        {formatTime(elapsedTime)}
      </span>
      {sessionDetails.length > 0 && more && (
        <div className={styles.more} id="modal">
          <ul>
            {sessionDetails.map(({ user, totalDuration }) => (
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
