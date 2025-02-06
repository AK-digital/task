"use client";

import { updateBoard } from "@/actions/board";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function UpdateBoard({ board, projectId }) {
  const [isEdit, setIsEdit] = useState(false);
  const updateBoardWithProjectId = updateBoard.bind(
    null,
    board?._id,
    projectId
  );
  const [state, formAction, pending] = useActionState(
    updateBoardWithProjectId,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      setIsEdit(false);
    }
  }, [state]);

  return (
    <div>
      {isEdit ? (
        <form action={formAction}>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={board?.title}
          />
          <button type="Submit" hidden>
            Enregistrer les modifications
          </button>
        </form>
      ) : (
        <span onClick={(e) => setIsEdit(true)}>{board?.title}</span>
      )}
    </div>
  );
}
