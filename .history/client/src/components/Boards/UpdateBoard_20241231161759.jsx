"use client";

import { useState } from "react";

export default function UpdateBoard({ board }) {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <div>
      <span onClick={setIsEdit(true)}>{board?.title}</span>
    </div>
  );
}
