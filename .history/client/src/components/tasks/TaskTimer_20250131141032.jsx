"use client";

import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function TaskTimer() {
  const [timer, setTimer] = useState(0);
  function handlePlayTimer() {
    setTimeout(() => {
      setTimer(timer + 1);
    }, 1000);
  }
  return (
    <div>
      <span>
        <FontAwesomeIcon icon={faPlayCircle} onClick={handlePlayTimer} />
        {timer}
      </span>
    </div>
  );
}
