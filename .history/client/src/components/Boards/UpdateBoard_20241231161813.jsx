"use client";

import { useState } from "react";

export default function UpdateBoard({ board }) {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <div>
      <span onClick={(e) => setIsEdit(true)}>{board?.title}</span>
    </div>
  );
}
