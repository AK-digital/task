"use client";
import { updateBoard } from "@/actions/board";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { ChevronDown, ChevronRight } from "lucide-react";
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

  const debouncedUpdateTask = useDebouncedCallback(async (value) => {
    const response = await updateBoard(
      board?._id,
      board?.projectId,
      optimisticColor,
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
        <ChevronDown
          style={{ color: `${optimisticColor}` }}
          onClick={(e) => setOpen(!open)}
          size={20}
        />
      ) : (
        <ChevronRight
          style={{ color: `${optimisticColor}` }}
          onClick={(e) => setOpen(!open)}
          size={20}
        />
      )}
      {edit ? (
        <>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={title}
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
          {title}
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

      <DeleteBoard boardId={board?._id} projectId={board?.projectId} />

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
