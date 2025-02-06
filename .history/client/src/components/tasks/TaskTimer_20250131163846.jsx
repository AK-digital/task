"use client";
import { taskEndTimer, taskStartTimer } from "@/api/task";
import styles from "@/styles/components/tasks/task-timer.module.css";
import { isNotEmpty } from "@/utils/utils";
import { faPauseCircle, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { duration } from "moment";
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

    const res = await taskEndTimer(task?._id, task?.projectId);

    console.log(res);
  }

  async function handlePlayTimer() {
    setIsRunning(true);
    const res = await taskStartTimer(task?._id, task?.projectId);

    console.log(res);
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
            {sessions?.map((session) => {
              const user = session?.userId;

              return (
                <li>
                  <Image
                    src={user.picture || "/default-pfp.webp"}
                    width={30}
                    height={30}
                    alt={`Photo de profil de ${user?.firstName}`}
                  />
                  <span>
                    {formatTime(Math.floor(session?.duration / 1000))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
