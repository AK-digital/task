import styles from "@/styles/components/popups/taskInfo.module.css";

export default function TaskInfo({ message }) {
  return (
    <div className={styles.container}>
      <span className={styles.name}>{message}</span>
    </div>
  );
}
