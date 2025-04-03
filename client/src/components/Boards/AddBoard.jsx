"use client";
import { saveBoard } from "@/actions/board";
import styles from "@/styles/components/boards/add-board.module.css";
import { useActionState, useContext } from "react";
import { Plus } from "lucide-react";
import { AuthContext } from "@/context/auth";
import { checkRole } from "@/utils/utils";

const initialState = {
  status: "pending",
  payload: null,
  message: "",
  errors: null,
};

export default function AddBoard({ project }) {
  const { uid } = useContext(AuthContext);
  const saveBoardWithProjectId = saveBoard.bind(null, project?._id);
  const [state, formAction, pending] = useActionState(
    saveBoardWithProjectId,
    initialState
  );
  const isAuthorized = checkRole(
    project,
    ["owner", "manager", "team", "customer"],
    uid
  );

  if (!isAuthorized) return null;

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
