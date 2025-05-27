import styles from "@/styles/components/task/task-skeletons.module.css";

export default function TaskSkeletons({ displayedElts }) {
  const { isCheckbox, isDrag, isProject, isBoard } = displayedElts;

  return (
    <div className={styles.container}>
      {Array.from({ length: 16 }).map((_, idx) => {
        return (
          <div className={styles.task} key={idx}>
            <div className={styles.checkbox}></div>
            <div className={styles.text}></div>
            {isProject && <div className={styles.project}></div>}
            {isBoard && <div className={styles.board}></div>}
            <div className={styles.admin}></div>
            <div className={styles.status}></div>
            <div className={styles.priority}></div>
            <div className={styles.deadline}></div>
            <div className={styles.estimate}></div>
            <div className={styles.timer}></div>
          </div>
        );
      })}
    </div>
  );
}
