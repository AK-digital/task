import styles from "@/styles/components/tasks/task-more.module.css";
export default function TaskMore() {
  return (
    <div className={styles.container}>
      {/* Description */}
      <div>
        <label>Description</label>
        <textarea name="description" id="description"></textarea>
      </div>
      {/* Conversation */}
      <div></div>
    </div>
  );
}
