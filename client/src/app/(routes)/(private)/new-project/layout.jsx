"use client";
import styles from "@/styles/layouts/new-project-layout.module.css";

export default function NewProjectLayout({ children }) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
} 