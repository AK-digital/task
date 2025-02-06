"use client";
import Modal from "@/layouts/Modal";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function BoardHeader({ board, open, setOpen, tasks }) {
  const [edit, setEdit] = useState(false);
  const [openColors, setOpenColors] = useState(false);

  const colors = board?.colors;

  return (
    <div className={styles.container} data-open={open}>
      <form action="">
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
            style={{ color: `${board?.colors[0]}` }}
            onClick={(e) => setEdit(true)}
          >
            {board?.title}
          </span>
        )}
        <span
          className={styles.bullet}
          style={{ backgroundColor: `${board?.colors[0]}` }}
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
                    <li key={idx} style={{ backgroundColor: `${color}` }}></li>
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
