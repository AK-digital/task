"use client";
import styles from "@/styles/components/tasks/task-timer.module.css";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function TaskTimer() {
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(intervalId); // Clear the interval when the timer stops
    }
    return () => clearInterval(intervalId); // Clean up the interval when the component unmounts or `isRunning` changes
  }, [isRunning]);

  const handlePlayPauseTimer = () => {
    if (isRunning) setIsRunning(false);
    if (!isRunning) setIsRunning(true);
    setIsRunning((prev) => !prev); // Toggle timer start/stop
  };
  return (
    <div className={styles.container}>
      <span>
        <FontAwesomeIcon icon={faPlayCircle} onClick={handlePlayPauseTimer} />
        {timer}
      </span>
    </div>
  );
}
