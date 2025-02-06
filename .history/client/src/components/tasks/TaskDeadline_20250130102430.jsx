"use client";
import styles from "@/styles/components/tasks/task-deadline.module.css";
import { updateTaskDeadline } from "@/actions/task";
import { useActionState, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "moment/locale/fr"; // Importer la locale française

moment.locale("fr"); // Appliquer la locale française

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
  const deadlineMoment = moment(deadline, "YYYY-MM-DD");
  const isPastDeadline = deadlineMoment.isBefore(moment(), "day");
  const formattedDeadline = deadlineMoment.format("D MMMM");

  function handleUpdateDate() {
    form.current.requestSubmit();
    setIsEditing(false); // Fermer l'input après la soumission
  }

  const displayDate = formattedDeadline ?? "Aucune deadline";

  return (
    <div className={styles.container}>
      {isEditing ? (
        <form action={formAction} ref={form}>
          <input
            type="date"
            name="deadline"
            id="deadline"
            defaultValue={deadline}
            onChange={handleUpdateDate}
            onBlur={() => setIsEditing(false)} // Cacher l'input quand l'utilisateur clique ailleurs
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
