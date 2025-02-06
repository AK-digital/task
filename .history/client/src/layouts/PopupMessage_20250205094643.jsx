import styles from "@/styles/layouts/popup-message.module.css";
import { useState } from "react";

export default function PopupMessage({ status, title, message }) {
  return (
    <div className={styles.container} data-status={status}>
      <div className={styles.header}>
        <span>{title}</span>
      </div>
      <div className={styles.content}>
        <p>{message}</p>
      </div>
    </div>
  );
}
