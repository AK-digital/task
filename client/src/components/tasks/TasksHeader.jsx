import styles from "@/styles/components/tasks/tasks-header.module.css";

export default function TasksHeader() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.wrapper}>
          {/* Text */}
          <div className={styles.text}>
            <span>Tâche</span>
          </div>
          {/* Responsibles */}
          <div className={styles.responsibles}>
            <span>Admin</span>
          </div>
          {/* Status */}
          <div className={styles.status}>
            <span>Status</span>
          </div>
          {/* Priorité */}
          <div className={styles.priority}>
            <span>Priorité</span>
          </div>
          <div className={styles.deadline}>
            <span>Échéance</span>
          </div>
          <div className={styles.timer}>
            <span>Temps</span>
          </div>
          <div className={styles.last}>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
