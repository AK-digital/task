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
  const [openColor, setOpenColor] = useState(false);
  const [color, setColor] = useState("");

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
      setOpenColor(false);
    }
  }, [state]);

  return (
    <div data-pending={pending} className="[&>input]:max-w-max">
      <form action={formAction}>
        {isEdit ? (
          <div>
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
            <div id="overlay-hidden" onClick={(e) => setIsEdit(false)}></div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <span
              onClick={(e) => setIsEdit(true)}
              style={{ color: `${board?.color}` }}
            >
              {board?.title}
            </span>
            <span
              style={{ backgroundColor: `${board?.color}` }}
              onClick={(e) => setOpenColor(!openColor)}
              className="w-4 h-4 rounded-full cursor-pointer"
            ></span>
            {openColor && (
              <div>
                <input
                  type="text"
                  name="color"
                  id="color"
                  defaultValue={board?.color}
                />
              </div>
            )}
          </div>
        )}
        <button type="Submit" hidden>
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
