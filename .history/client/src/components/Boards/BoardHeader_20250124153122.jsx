"use client";
import styles from "@/styles/components/boards/BoardHeader.module.css";
import { useState } from "react";

export default function BoardHeader({ board, open, setOpen, tasks }) {
  return (
    <div className={styles.container} data-open={open}>
      {open ? (
        <FontAwesomeIcon icon={faCaretDown} onClick={(e) => setOpen(!open)} />
      ) : (
        <FontAwesomeIcon icon={faCaretRight} onClick={(e) => setOpen(!open)} />
      )}
      <span style={{ color: `${board?.colors[0]}` }}>{board?.title}</span>
      <span
        className={styles.bullet}
        style={{ backgroundColor: `${board?.colors[0]}` }}
      ></span>
      {!open && <span className={styles.count}>{tasks?.length} Tâches</span>}
    </div>
  );
}
