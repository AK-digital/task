"use client";
import styles from "@/styles/components/tasks/task-deadline.module.css";
import { updateTaskDeadline } from "@/actions/task";
import { useActionState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
moment.locale("fr");

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
      {deadline ? (
        <span>
          <FontAwesomeIcon icon={faCalendarAlt} />
          {moment(deadline).format()}
        </span>
      ) : (
        <form action={formAction} ref={form}>
          <input
            type="date"
            name="deadline"
            id="deadline"
            defaultValue={deadline}
            onChange={handleUpdateDate}
          />
        </form>
      )}
    </div>
  );
}
