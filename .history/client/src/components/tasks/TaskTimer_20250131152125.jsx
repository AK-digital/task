"use client";
import styles from "@/styles/components/tasks/task-timer.module.css";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function TaskTimer() {
  const [timer, setTimer] = useState(0); // Stocker le temps en secondes
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

  const handleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  // Fonction pour formater le temps en hh:mm:ss
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
          <FontAwesomeIcon icon={faPlayCircle} onClick={handleTimer} />
        ) : (
          <FontAwesomeIcon icon={faPlayCircle} onClick={handleTimer} />
        )}
        {formatTime(timer)}
      </span>
    </div>
  );
}
