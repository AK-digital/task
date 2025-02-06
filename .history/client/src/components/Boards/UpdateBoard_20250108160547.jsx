"use client";
import styles from "@/styles/components/boards/update-board.module.css";
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
    <div className={styles["update-board__container"]}>
      {isEdit ? (
        <form action={formAction}>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={board?.title}
            autoFocus
            style={{
              position: "relative",
              zIndex: "2001",
            }}
          />
          <button type="Submit" hidden>
            Enregistrer les modifications
          </button>
          <div id="overlay-hidden" onClick={(e) => setIsEdit(false)}></div>
        </form>
      ) : (
        <div className={styles["update-board__title"]}>
          <span
            onClick={(e) => setIsEdit(true)}
            style={{ color: `${board?.color}` }}
          >
            {board?.title}
          </span>
          <span style={{ backgroundColor: `${board?.color}` }}></span>
          <div></div>
        </div>
      )}
    </div>
  );
}
