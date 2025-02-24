import styles from "@/styles/components/tasks/selected-tasks.module.css";
import { Archive, Trash, X } from "lucide-react";

export default function SelectedTasks({ tasks }) {
  return (
    <div className={styles.container}>
      {/* Main content */}
      <div className={styles.main}>
        <div className={styles.count}>
          <span> {tasks.length}</span>
        </div>
        <div className={styles.header}>
          <span>Tâche séléctionné(s)</span>
        </div>
        {/* actions */}
        <div className={styles.actions}>
          {/* action */}
          <div className={styles.action}>
            <Archive size={20} />
            <span>Archiver</span>
          </div>
          <div className={styles.action}>
            <Trash size={20} />
            <span>Supprimer</span>
          </div>
          <div className={styles.action}>
            <X size={22} />
          </div>
        </div>
      </div>
      {/* Close, reset selected tasks */}
      {/* <div className={styles.close}>
        <X />
      </div> */}
    </div>
  );
}
