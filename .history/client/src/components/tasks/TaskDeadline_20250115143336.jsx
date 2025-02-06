"use client";
import { useActionState, useRef } from "react";

export default function TaskDeadline({ task }) {
  const form = useRef(null);
  const [state, formAction, pending] = useActionState();

  function handleUpdateDate() {
    form.current.requestSubmit();
  }
  return (
    <div className={styles["task__deadline"]}>
      <form action="" ref={form}>
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
