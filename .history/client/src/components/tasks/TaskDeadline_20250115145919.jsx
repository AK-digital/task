"use client";
import styles from "@/styles/components/tasks/task-deadline.module.css";
import { updateTaskDeadline } from "@/actions/task";
import { useActionState, useRef } from "react";

const initialState = {};

export default function TaskDeadline({ task }) {
  const form = useRef(null);
  const updateTaskDeadlineWithIds = updateTaskDeadline.bind(
    null,
    task?._id,
    task.projectId
  );
  const [state, formAction, pending] = useActionState(
    updateTaskDeadlineWithIds,
    initialState
  );

  const deadline = task?.deadline?.split("T")[0];

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
          defaultValue={task?.deadline}
          onChange={handleUpdateDate}
        />
      </form>
    </div>
  );
}
