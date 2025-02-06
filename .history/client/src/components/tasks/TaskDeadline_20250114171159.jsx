export default function TaskDeadline() {
  return (
    <div className={styles["task__deadline"]}>
      <form action="">
        <input
          type="date"
          name="deadline"
          id="deadline"
          defaultValue={deadline}
          onChange={handleUpdateDate}
        />
      </form>
    </div>
  );
}
