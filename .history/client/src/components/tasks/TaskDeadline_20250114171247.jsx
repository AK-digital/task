import { useRef } from "react";

export default function TaskDeadline({ task }) {
  const form = useRef(null);

  function handleUpdateDate() {}
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
