"use client";
import Modal from "@/layouts/Modal";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export default function BoardHeader({ board, open, setOpen, tasks }) {
  const [openColors, setOpenColors] = useState(false);

  const colors = board?.colors

  return (
    <div className={styles.container} data-open={open}>
      {open ? (
        <FontAwesomeIcon icon={faCaretDown} onClick={(e) => setOpen(!open)} />
      ) : (
        <FontAwesomeIcon icon={faCaretRight} onClick={(e) => setOpen(!open)} />
      )}
      <span className={styles.title} style={{ color: `${board?.colors[0]}` }}>
        {board?.title}
      </span>
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
      {openColors && <div id="modal">
        <ul>
            {board?.colors.map((color) => {
                return <li>
                    
                </li>
            }))}
        </ul>
        </div>
        }
    </div>
  );
}
