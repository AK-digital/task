"use client";
import { saveBoard } from "@/actions/board";
import styles from "@/styles/components/boards/add-board.module.css";
import { useActionState } from "react";
import { Plus } from "lucide-react";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function AddBoard({ projectId }) {
  const saveBoardWithProjectId = saveBoard.bind(null, projectId);
  const [state, formAction, pending] = useActionState(
    saveBoardWithProjectId,
    initialState
  );

  return (
    <div className={styles["container"]}>
      <form action={formAction} className={styles["container__form"]}>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue="Nouveau tableau"
          hidden
        />
        <button
          type="submit"
          className={styles.addButton}
          data-disabled={pending}
          disabled={pending}
        >
          <Plus size={18} />
          Tableau vide
        </button>
      </form>
    </div>
  );
}
