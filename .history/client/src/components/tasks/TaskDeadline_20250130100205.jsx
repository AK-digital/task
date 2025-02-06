"use client";
import styles from "@/styles/components/tasks/task-deadline.module.css";
import { updateTaskDeadline } from "@/actions/task";
import { useActionState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "moment/locale/fr"; // Importer la locale française

moment.locale("fr"); // Appliquer la locale française

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

  const deadlineMoment = moment(deadline, "YYYY-MM-DD");
  const isPastDeadline = deadlineMoment.isBefore(moment(), "day"); // Vérifie si la date est dépassée
  const formattedDeadline = deadlineMoment.format("D MMMM");

  return (
    <div className={styles.container}>
      {deadline ? (
        <span className={styles.deadline} data-past={isPastDeadline}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          {formattedDeadline}
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
