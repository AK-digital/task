"use client";
import styles from "@/styles/components/task/task-pending.module.css";
import { GripVertical, MessageCircle } from "lucide-react";

export function TaskPending({ text }) {
  return (
    <div className={styles.container}>
      <div className={`${styles.checkbox} ${styles.row}`}>
        <input type="checkbox" name="task" id="task" />
      </div>

      <div className={`${styles.grip} ${styles.row}`}>
        <GripVertical size={20} />
      </div>

      <div className={styles.text}>
        <span>{text}</span>
      </div>

      <div className={`${styles.comment} ${styles.row}`}>
        <MessageCircle size={24} fillOpacity={0} />
      </div>
    </div>
  );
}
