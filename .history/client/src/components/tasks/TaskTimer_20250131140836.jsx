"use client";

import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function TaskTimer() {
  const [timer, setTimer] = useState(0);
  return (
    <div>
      <span>
        <FontAwesomeIcon icon={faPlayCircle} />
      </span>
    </div>
  );
}
