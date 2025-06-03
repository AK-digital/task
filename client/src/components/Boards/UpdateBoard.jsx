"use client";
import styles from "@/styles/components/boards/update-board.module.css";
import { updateBoard } from "@/actions/board";
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function UpdateBoard({ board, projectId }) {
  const { t } = useTranslation();
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
    <div className={styles["update-board__container"]} data-pending={pending}>
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
          <div className={styles["update-board__title"]}>
            <span
              onClick={(e) => setIsEdit(true)}
              style={{ color: `${board?.color}` }}
            >
              {board?.title}
            </span>
            <span
              style={{ backgroundColor: `${board?.color}` }}
              onClick={(e) => setOpenColor(!openColor)}
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
          {t("boards.save_changes")}
        </button>
      </form>
    </div>
  );
}
