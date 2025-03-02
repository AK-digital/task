import React from 'react';
import styles from '@/styles/components/tasks/tasks-header.module.css';

export default function TasksHeader() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.wrapper}>
          <div className={styles.checkbox}></div>
          <div className={styles.drag}></div>
          <div className={styles.text}>Tâches</div>
          <div className={styles.comment}></div>
          <div className={styles.responsibles}>Admin</div>
          <div className={styles.status}>Statut</div>
          <div className={styles.priority}>Priorité</div>
          <div className={styles.deadline}>Échéance</div>
          <div className={styles.timer}>Temps</div>
          <div className={styles.actions}></div>
        </div>
      </div>
    </div>
  );
}
