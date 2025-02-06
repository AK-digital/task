"use client";
import { useState } from "react";

export default function BoardHeader({ board, open, setOpen }) {
  return (
    <div className={styles.container} data-open={dropdownOpen}>
      {dropdownOpen ? (
        <FontAwesomeIcon icon={faCaretDown} onClick={(e) => setOpen(!open)} />
      ) : (
        <FontAwesomeIcon icon={faCaretRight} onClick={handleDropdown} />
      )}
      <span style={{ color: `${board?.colors[0]}` }}>{board?.title}</span>
      <span
        className={styles.bullet}
        style={{ backgroundColor: `${board?.colors[0]}` }}
      ></span>
      {!dropdownOpen && (
        <span className={styles.count}>{tasks?.length} Tâches</span>
      )}
    </div>
  );
}
