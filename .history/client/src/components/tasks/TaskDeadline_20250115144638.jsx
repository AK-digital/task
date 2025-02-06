"use client";
import { updateTaskDeadline } from "@/actions/task";
import { useActionState, useRef } from "react";

const initialState = {};

export default function TaskDeadline({ task }) {
  const form = useRef(null);
  const [state, formAction, pending] = useActionState(
    updateTaskDeadline,
    initialState
  );

  function handleUpdateDate() {
    form.current.requestSubmit();
  }
  return (
    <div className={styles["task__deadline"]}>
      <form action={formAction} ref={form}>
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
