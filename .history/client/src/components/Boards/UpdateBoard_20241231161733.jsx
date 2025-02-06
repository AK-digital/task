"use client";

import { useState } from "react";

export default function UpdateBoard({ board }) {
  const [isWritting, setIsWritting] = useState(false);
  return (
    <div>
      <span>{board?.title}</span>
    </div>
  );
}
