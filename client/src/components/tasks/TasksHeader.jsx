import React from "react";
import styles from "@/styles/components/tasks/tasks-header.module.css";
import { useUserRole } from "@/app/hooks/useUserRole";

export default function TasksHeader({ project }) {
  const canEdit = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);
  const canDrag = useUserRole(project, ["owner", "manager", "team"]);
  return (
    <div className={styles.container}>
      {canEdit && <div className={`${styles.selection} ${styles.row}`}></div>}
      {canDrag && <div className={`${styles.drag} ${styles.row}`}></div>}
      <div className={`${styles.text}`}>Tâches</div>
      <div className={`${styles.responsibles} ${styles.row}`}>Admin</div>
      <div className={`${styles.status} ${styles.row}`}>Statut</div>
      <div className={`${styles.priority} ${styles.row}`}>Priorité</div>
      <div className={`${styles.deadline} ${styles.row}`}>Échéance</div>
      <div className={`${styles.estimation} ${styles.row}`}>Estimation</div>
      <div className={`${styles.timer} ${styles.row}`}>Temps</div>
      <div className={`${styles.remove} ${styles.row}`}></div>
    </div>
  );
}
