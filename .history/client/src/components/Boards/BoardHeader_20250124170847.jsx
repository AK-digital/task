"use client";
import { updateBoard } from "@/actions/board";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useActionState, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

const initialState = {
  status: "pending",
  message: "",
  errors: null,
};

export default function BoardHeader({
  board,
  open,
  setOpen,
  tasks,
  setOptimisticColor,
  optimisticColor,
}) {
  const [edit, setEdit] = useState(false);
  const [openColors, setOpenColors] = useState(false);
  const [title, setTitle] = useState(board?.title);
  const updateBoardWithIds = updateBoard.bind(
    null,
    board?._id,
    board?.projectId,
    color
  );
  const [state, formAction, pending] = useActionState(
    updateBoardWithIds,
    initialState
  );

  const colors = board?.colors;

  async function handleColor(e) {
    const value = e.target.dataset.value;

    setColor(value);

    const response = await updateBoard(
      board?._id,
      board?.projectId,
      value,
      title
    );

    if (!response?.success) setColor(board?.color);
  }

  // Créer un callback avec un délai de 300ms
  const debouncedUpdateTask = useDebouncedCallback(async (value) => {
    const response = await updateBoard(
      board?._id,
      board?.projectId,
      color,
      value
    );

    if (!response?.success) setTitle(board?.title);
  }, 600);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);

    debouncedUpdateTask(value);
  };

  return (
    <div className={styles.container} data-open={open}>
      {open ? (
        <FontAwesomeIcon
          style={{ color: `${color}` }}
          icon={faCaretDown}
          onClick={(e) => setOpen(!open)}
        />
      ) : (
        <FontAwesomeIcon
          style={{ color: `${color}` }}
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
            onChange={handleTitleChange}
          />
          <div id="modal-layout-opacity" onClick={(e) => setEdit(false)}></div>
        </>
      ) : (
        <span
          className={styles.title}
          style={{ color: `${color}` }}
          onClick={(e) => setEdit(true)}
        >
          {board?.title}
        </span>
      )}
      <span
        className={styles.bullet}
        style={{ backgroundColor: `${color}` }}
        onClick={(e) => setOpenColors(true)}
      ></span>
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
                    onClick={handleColor}
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
    </div>
  );
}
