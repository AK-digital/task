"use client";
import styles from "@/styles/components/tasks/task-deadline.module.css";
import { updateTaskDeadline } from "@/actions/task";
import { useActionState, useRef, useState } from "react";
import { Calendar } from "lucide-react";
import moment from "moment";
import "moment/locale/fr";

const initialState = {};

export default function TaskDeadline({ task }) {
  const form = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

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
  const deadlineMoment = moment(deadline, "YYYY MM DD");
  const isPastDeadline =
    deadlineMoment.isBefore(moment(), "day") && task?.status !== "Terminée";
  const formattedDeadline = deadlineMoment.isValid()
    ? deadlineMoment.format("D MMMM", "fr")
    : null;

  function handleUpdateDate(e) {
    const date = e.target.value || null;
    if (date !== deadlineMoment._i) {
      form.current.requestSubmit();
    }
  }

  const displayDate = formattedDeadline ?? "__/__/__";

  return (
    <div className={styles.container}>
      {isEditing ? (
        <form action={formAction} ref={form}>
          <Calendar />
          <input
            type="date"
            name="deadline"
            id="deadline"
            defaultValue={deadline}
            onChange={handleUpdateDate}
            onBlur={(e) => setIsEditing(false)}
            autoFocus
          />
        </form>
      ) : (
        <span
          className={styles.deadline}
          data-past={isPastDeadline}
          data-empty={!deadline}
          onClick={() => setIsEditing(true)} // Ouvrir l'input au clic
        >
          <Calendar />
          {displayDate}
        </span>
      )}
    </div>
  );
}
