import styles from "@/styles/layouts/popup-message.module.css";
import { useState } from "react";

export default function PopupMessage({ status, title, message }) {
  const [display, setDisplay] = useState(false);

  return (
    <div className={styles.container} data-status={status}>
      <div>
        <span>{title}</span>
      </div>
      <div>
        <p>{message}</p>
      </div>
    </div>
  );
}
