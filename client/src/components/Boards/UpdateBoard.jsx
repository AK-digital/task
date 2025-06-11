"use client";
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

  const updateBoardWithProjectId = updateBoard.bind(
    null,
    board?._id,
    projectId,
    null,
    null,
    t
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
            <div onClick={(e) => setIsEdit(false)} className="absolute left-0 top-0 w-full h-full z-2001"></div>
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
          {t("boards.save_changes")}
        </button>
      </form>
    </div>
  );
}
