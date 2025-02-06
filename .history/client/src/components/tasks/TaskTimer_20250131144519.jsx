"use client";
import styles from "@/styles/components/tasks/task-timer.module.css";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function TaskTimer() {
  const [timer, setTimer] = useState(0);
  function handlePlayTimer() {
    setInterval(() => {
      setTimer(timer + 1);
    }, 1000);
  }
  return (
    <div className={styles.container}>
      <span>
        <FontAwesomeIcon icon={faPlayCircle} onClick={handlePlayTimer} />
        {timer}
      </span>
    </div>
  );
}
