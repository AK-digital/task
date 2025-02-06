"use client";

import { useState } from "react";

export default function UpdateBoard({ board }) {
  const [isEdit, setIsEdit] = useState(false);
  return (
    <div>
      {isEdit ? (
        <input
          type="text"
          name="title"
          id="title"
          defaultValue={board?.title}
        />
      ) : (
        <span onClick={(e) => setIsEdit(true)}>{board?.title}</span>
      )}
    </div>
  );
}
