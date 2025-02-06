"use client";
import styles from "@/styles/components/tasks/task-timer.module.css";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function TaskTimer() {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  function handlePlayPauseTimer() {
    if (isRunning)
      setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);

    setIsRunning(true);
  }
  return (
    <div className={styles.container}>
      <span>
        <FontAwesomeIcon icon={faPlayCircle} onClick={handlePlayPauseTimer} />
        {timer}
      </span>
    </div>
  );
}
