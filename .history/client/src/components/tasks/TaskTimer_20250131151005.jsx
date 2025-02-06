"use client";
import styles from "@/styles/components/tasks/task-timer.module.css";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function TaskTimer() {
  const [timer, setTimer] = useState("00:00:00");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        const seconds = timer.split(":")[2];
        let secondsNumber = +seconds;

        secondsNumber++;

        console.log(secondsNumber);
        setTimer(`00:00:${secondsNumber}`);
        // setTimer((prevTimer) => {
        //   timer + 1;
        // });
      }, 1000);
    } else {
      clearInterval(intervalId); // Clear the interval when the timer stops
    }
    return () => clearInterval(intervalId); // Clean up the interval when the component unmounts or `isRunning` changes
  }, [isRunning]);

  const handleTimer = () => {
    setIsRunning((prev) => !prev); // Toggle timer start/stop
  };

  return (
    <div className={styles.container}>
      <span>
        <FontAwesomeIcon icon={faPlayCircle} onClick={handleTimer} />
        {timer}
      </span>
    </div>
  );
}
