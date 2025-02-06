"use client";
import { taskStartTimer } from "@/api/task";
import styles from "@/styles/components/tasks/task-timer.module.css";
import { faPauseCircle, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function TaskTimer({ task }) {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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
    <div className={styles.container}>
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
    </div>
  );
}
