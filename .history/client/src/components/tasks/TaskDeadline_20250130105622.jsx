"use client";
import styles from "@/styles/components/tasks/task-deadline.module.css";
import { updateTaskDeadline } from "@/actions/task";
import { useActionState, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "moment/locale/fr"; // Importer la locale française

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
  const isPastDeadline = deadlineMoment.isBefore(moment(), "day");
  const formattedDeadline = deadlineMoment.isValid()
    ? deadlineMoment.format("D MMMM", "fr")
    : null;

  function handleUpdateDate(e) {
    const date = e.target.value;
    // Prevents API call if the date is unchanged
    if (date !== deadlineMoment._i) {
      form.current.requestSubmit();
    }
    setIsEditing(false);
  }

  const displayDate = formattedDeadline ?? "Définir une échéance";

  return (
    <div className={styles.container}>
      {isEditing ? (
        <form action={formAction} ref={form}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          <input
            type="date"
            name="deadline"
            id="deadline"
            defaultValue={deadline}
            onBlur={handleUpdateDate} // Cacher l'input quand l'utilisateur clique ailleurs
            autoFocus
          />
        </form>
      ) : (
        <span
          className={styles.deadline}
          data-past={isPastDeadline}
          onClick={() => setIsEditing(true)} // Ouvrir l'input au clic
        >
          <FontAwesomeIcon icon={faCalendarAlt} />
          {displayDate}
        </span>
      )}
    </div>
  );
}
