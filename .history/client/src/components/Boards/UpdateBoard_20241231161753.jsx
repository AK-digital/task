"use client";

import { useState } from "react";

export default function UpdateBoard({ board }) {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <div>
      <span>{board?.title}</span>
    </div>
  );
}
