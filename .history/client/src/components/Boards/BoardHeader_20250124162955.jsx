"use client";
import { updateBoard } from "@/actions/board";
import Modal from "@/layouts/Modal";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useActionState, useRef, useState } from "react";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function BoardHeader({ board, open, setOpen, tasks }) {
  const form = useRef(null);
  const [edit, setEdit] = useState(false);
  const [openColors, setOpenColors] = useState(false);
  const [color, setColor] = useState(board?.color);
  const updateBoardWithIds= updateBoard.bind(null, board?._id, board?.projectId);
  const [] = useActionState(,initialState);

  const colors = board?.colors;

  function handleColor() {
    form?.current?.submitRequest();
  }

  return (
    <div className={styles.container} data-open={open}>
      <form action="" ref={form}>
        {open ? (
          <FontAwesomeIcon icon={faCaretDown} onClick={(e) => setOpen(!open)} />
        ) : (
          <FontAwesomeIcon
            icon={faCaretRight}
            onClick={(e) => setOpen(!open)}
          />
        )}
        {edit ? (
          <>
            <input
              type="text"
              name="title"
              id="title"
              defaultValue={board?.title}
            />
            <button type="submit" hidden>
              Envoyer
            </button>
          </>
        ) : (
          <span
            className={styles.title}
            style={{ color: `${board?.color}` }}
            onClick={(e) => setEdit(true)}
          >
            {board?.title}
          </span>
        )}
        <span
          className={styles.bullet}
          style={{ backgroundColor: `${board?.color}` }}
          onClick={(e) => setOpenColors(true)}
        ></span>
        <input
          type="text"
          id="color"
          name="color"
          hidden
          defaultValue={board?.color}
        />
        {!open && tasks?.length >= 1 && (
          <span className={styles.count}>
            {tasks?.length > 1
              ? `${tasks?.length} Tâches`
              : `${tasks?.length} Tâche`}
          </span>
        )}
        {openColors && (
          <>
            <div className={styles.modal} id="modal">
              <ul>
                {colors?.map((color, idx) => {
                  return (
                    <li
                      key={idx}
                      style={{ backgroundColor: `${color}` }}
                      data-value={color}
                    ></li>
                  );
                })}
              </ul>
            </div>
            <div
              id="modal-layout-opacity"
              onClick={(e) => setOpenColors(false)}
            ></div>
          </>
        )}
      </form>
    </div>
  );
}
