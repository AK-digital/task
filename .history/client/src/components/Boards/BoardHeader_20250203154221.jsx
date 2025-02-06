"use client";
import { updateBoard } from "@/actions/board";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import DeleteBoard from "./DeleteBoard";

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
  const [showDelete, setShowDelete] = useState(false);

  const colors = board?.colors;

  async function handleColor(e) {
    const value = e.target.dataset.value;
    setOptimisticColor(value);
    const response = await updateBoard(
      board?._id,
      board?.projectId,
      value,
      title
    );
    if (!response?.success) setOptimisticColor(board?.color);
  }

  const handleTitleChange = async (e) => {
    const value = e.target.value;
    setTitle(value);
    const response = await updateBoard(
      board?._id,
      board?.projectId,
      optimisticColor,
      value
    );
    if (!response?.success) setTitle(board?.title);
  };

  return (
    <div
      className={styles.container}
      data-open={open}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {open ? (
        <FontAwesomeIcon
          style={{ color: `${optimisticColor}` }}
          icon={faCaretDown}
          onClick={(e) => setOpen(!open)}
        />
      ) : (
        <FontAwesomeIcon
          style={{ color: `${optimisticColor}` }}
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
          style={{ color: `${optimisticColor}` }}
          onClick={(e) => setEdit(true)}
        >
          {board?.title}
        </span>
      )}
      <span
        className={styles.bullet}
        style={{ backgroundColor: `${optimisticColor}` }}
        onClick={(e) => setOpenColors(true)}
      ></span>
      {!open && tasks?.length >= 1 && (
        <span className={styles.count}>
          {tasks?.length > 1
            ? `${tasks?.length} Tâches`
            : `${tasks?.length} Tâche`}
        </span>
      )}
      {showDelete && (
        <DeleteBoard boardId={board?._id} projectId={board?.projectId} />
      )}
      {openColors && (
        <>
          <div className={styles.modal} id="popover">
            <ul>
              {colors?.map((color, idx) => (
                <li
                  key={idx}
                  style={{ backgroundColor: `${color}` }}
                  data-value={color}
                  onClick={handleColor}
                ></li>
              ))}
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
