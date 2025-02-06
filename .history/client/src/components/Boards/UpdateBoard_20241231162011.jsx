"use client";

import { updateBoard } from "@/actions/board";
import { useState } from "react";

export default function UpdateBoard({ board, projectId }) {
  const [isEdit, setIsEdit] = useState(false);
  const saveTaskWithProjectId = updateBoard.bind(null, board?._id, projectId);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );
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
